import type { QueryConfig, ReactQueryConfig } from "react-query";
import type { Observable } from "subscriptions-transport-ws";
import {
  errorExchange,
  storeExchange,
  fetchExchange,
  composeExchanges,
  fallbackExchange,
  normalizerExchange,
} from "./exchanges";
import { QueryCache } from "react-query";

import { createOperation } from "./operation";
import { createQueryCacheStore } from "./store/cacheStore";
import type {
  Operation,
  QueryKey,
  InfiniteQueryKey,
  Query,
  Variables,
  Response,
  Store,
  FetchOptions,
  Exchange,
  DebugEvent,
  GraphQLTaggedNode,
  Normalizer,
} from "./types";
import { createNormalizer } from "./normalizer";
import type { GraphQLSubscriptionClient } from "./subscriptionClient";

export interface GraphQLClientOptions {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryConfig: ReactQueryConfig;
  queryCache: QueryCache;
  onDebugEvent: <TQuery extends Query>(event: DebugEvent<TQuery>) => void;
  subscriptionClient: GraphQLSubscriptionClient | undefined;
  useStore: (() => Store) & {
    Provider?: React.FC<{}>;
  };
  normalizer: Normalizer;
  useExchanges: (client: GraphQLClient) => Exchange[];
}

export function useDefaultExchanges(client: GraphQLClient) {
  const store = client.useStore();

  return [
    storeExchange(store),
    normalizerExchange,
    errorExchange({
      onError: (error) => {
        throw error;
      },
    }),
    fetchExchange,
  ];
}

export class GraphQLClient {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryConfig: ReactQueryConfig<unknown, unknown>;
  cache: QueryCache;
  onDebugEvent: <TQuery extends Query>(event: DebugEvent<TQuery>) => void;
  useStore: (() => Store) & {
    Provider?: React.FC<{}>;
  };
  normalizer?: Normalizer;
  private useExchanges: (client: GraphQLClient) => Exchange[];
  subscriptionClient?: GraphQLSubscriptionClient;

  constructor({
    endpoint = "/graphql",
    fetchOptions = {},
    queryConfig = {},
    queryCache = new QueryCache(),
    useStore = createQueryCacheStore(),
    normalizer = createNormalizer(),
    onDebugEvent = () => {},
    useExchanges = useDefaultExchanges,
    subscriptionClient,
  }: Partial<GraphQLClientOptions>) {
    this.endpoint = endpoint;
    this.fetchOptions = fetchOptions;
    this.queryConfig = queryConfig;
    this.cache = queryCache;
    this.useStore = useStore;
    this.useExchanges = useExchanges;
    this.onDebugEvent = onDebugEvent;
    this.normalizer = normalizer;
    this.subscriptionClient = subscriptionClient;
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
    options: {
      variables: Variables<TQuery>;
      fetchOptions?: FetchOptions<Variables<TQuery>>;
    } = { variables: {} }
  ) {
    return createOperation(node, options) as Operation<TQuery>;
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
    if (!this.subscriptionClient) {
      throw new Error("No subscription client found!");
    }
    const subscriptionsClient = this.subscriptionClient;
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
