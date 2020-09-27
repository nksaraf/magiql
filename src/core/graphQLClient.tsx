import { QueryCache, QueryConfig, ReactQueryConfig } from "react-query";
import { SubscriptionClient, Observable } from "subscriptions-transport-ws";
import {
  errorExchange,
  storeExchange,
  fetchExchange,
  composeExchanges,
  fallbackExchange,
} from "./exchanges";

import { resolveFetchOptions } from "./fetchGraphQL";
import { createOperation } from "./operation";
import { createQueryCacheStore } from "./store/cacheStore";
import {
  Operation,
  QueryKey,
  InfiniteQueryKey,
  Query,
  Variables,
  Response,
  ConcreteRequest,
  Store,
  FetchOptions,
  Exchange,
  DebugEvent,
  GraphQLTaggedNode,
} from "./types";

export interface GraphQLClientOptions {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryConfig: ReactQueryConfig;
  queryCache: QueryCache;
  onDebugEvent: <TQuery extends Query>(event: DebugEvent<TQuery>) => void;
  subscriptions: {
    client: SubscriptionClient;
    endpoint: string;
    fetchOptions: FetchOptions<object>;
  };
  useStore: () => Store;
  useExchanges: (client: GraphQLClient) => Exchange[];
}

export function useDefaultExchanges(client: GraphQLClient) {
  const store = client.useStore();

  return [
    errorExchange({
      onError: (error) => {
        throw error;
      },
    }),
    storeExchange(store),
    fetchExchange,
  ];
}

export class GraphQLClient {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryConfig: ReactQueryConfig<unknown, unknown>;
  cache: QueryCache;
  onDebugEvent: <TQuery extends Query>(event: DebugEvent<TQuery>) => void;
  useStore: (() => Store) & { Provider?: React.FC<{}> };
  private useExchanges: (client: GraphQLClient) => Exchange[];
  subscriptions?: {
    client: SubscriptionClient;
    endpoint: string;
    fetchOptions: FetchOptions<object>;
  };

  constructor({
    endpoint = "/graphql",
    fetchOptions = () => ({}),
    queryConfig = {},
    queryCache = new QueryCache(),
    useStore = createQueryCacheStore(),
    onDebugEvent = console.log,
    useExchanges = useDefaultExchanges,
    subscriptions,
  }: Partial<GraphQLClientOptions>) {
    this.endpoint = endpoint;
    this.fetchOptions = fetchOptions;
    this.queryConfig = queryConfig;
    this.cache = queryCache;
    this.useStore = useStore;
    this.useExchanges = useExchanges;
    this.onDebugEvent = onDebugEvent;

    if (subscriptions && typeof window !== "undefined") {
      const {
        endpoint: subscriptionEndpoint = endpoint,
        fetchOptions: subscriptionFetchOptions = fetchOptions,
        client = new SubscriptionClient(subscriptionEndpoint, {
          reconnect: true,
          connectionParams: async () => {
            return await resolveFetchOptions(subscriptionFetchOptions, {
              operationKind: "subscription",
              endpoint: subscriptionEndpoint,
            });
          },
        }),
      } = subscriptions;
      this.subscriptions = {
        client,
        endpoint: subscriptionEndpoint,
        fetchOptions: subscriptionFetchOptions,
      };
    }
  }

  getInfinteQueryKey<TQuery extends Query>(
    operation: Operation<TQuery>
  ): InfiniteQueryKey<TQuery> {
    return [
      operation.request.node.params.name,
      operation.request.variables ?? {},
    ] as any;
  }

  buildOperation<TQuery extends Query>(
    node: string | GraphQLTaggedNode,
    variables: Variables<TQuery> = {},
    fetchOptions: FetchOptions<Variables<TQuery>> = {}
  ) {
    return createOperation(node, variables, fetchOptions) as Operation<TQuery>;
  }

  buildSubscription<TQuery extends Query>(
    operation: Operation<TQuery>,
    {
      onSuccess,
      onError,
      onSettled,
      ...options
    }: QueryConfig<Response<TQuery>, Error>
  ) {
    if (!this.subscriptions) {
      throw new Error("No subscription client found!");
    }
    const subscriptionsClient = this.subscriptions.client;
    const queryKey = this.getQueryKey(operation);
    const query = this.cache.buildQuery<Response<TQuery>, Error>(queryKey, {
      ...options,
      enabled: false,
    });
    let subscription: {
      unsubscribe: () => void;
    } | null = null;

    return {
      query,
      unsubscribe() {
        subscription?.unsubscribe();
      },
      execute() {
        const observable = subscriptionsClient.request({
          query: operation.request.node.params.text as string,
          variables: operation.request.variables,
          operationName: operation.request.node.params.name,
        }) as Observable<{ data: Response<TQuery> }>;

        if (!observable) {
          throw new Error("No subscription client found!");
        }

        subscription = observable.subscribe({
          next: (result) => {
            query.setData(result.data);
            onSuccess?.(result.data);
            onSettled?.(result.data, null);
          },
          error: (error) => {
            (query as any).dispatch({
              type: "Error",
              error,
            });
            onError?.(error);
            onSettled?.(undefined, error);
            subscription?.unsubscribe();
          },
          complete: () => {
            subscription?.unsubscribe();
          },
        });
      },
    };
  }

  getQueryKey<TQuery extends Query>(
    operation: Operation<TQuery>
  ): QueryKey<TQuery> {
    return [
      operation.request.node.params.name,
      operation.request.variables ?? {},
    ];
  }

  useExecutor() {
    const exchanges = this.useExchanges(this);
    return async <TQuery extends Query>(operation: Operation<TQuery>) => {
      const operate = composeExchanges(exchanges)({
        forward: fallbackExchange({
          client: this,
          forward: null,
          dispatchDebug: this.onDebugEvent,
        }),
        client: this,
        dispatchDebug: this.onDebugEvent,
      });

      return await operate(operation);
    };
  }
}
