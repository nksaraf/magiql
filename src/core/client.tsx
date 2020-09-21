import { QueryCache, QueryConfig, ReactQueryConfig } from "react-query";
import { SubscriptionClient, Observable } from "subscriptions-transport-ws";

import { fetchGraphQL, resolveFetchOptions } from "./fetch";
import { createOperation } from "./graphql-tag";
import { createQueryCacheStore } from "./store/cacheStore";
import {
  FetchOperation,
  OperationKind,
  OperationDescriptor,
  QueryKey,
  InfiniteQueryKey,
  Query,
  Variables,
  Response,
  ConcreteRequest,
  Store,
  FetchOptions,
  FetchResult,
} from "./types";

export interface GraphQLClientOptions {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryConfig: ReactQueryConfig;
  queryCache: QueryCache;
  subscriptions: {
    client: SubscriptionClient;
    endpoint: string;
    fetchOptions: FetchOptions<object>;
  };
  useStore: () => Store;
}

export class GraphQLClient {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryConfig: ReactQueryConfig<unknown, unknown>;
  cache: QueryCache;
  useStore: (() => Store) & { Provider?: React.FC<{}> };
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
    subscriptions,
  }: Partial<GraphQLClientOptions>) {
    this.endpoint = endpoint;
    this.fetchOptions = fetchOptions;
    this.queryConfig = queryConfig;
    this.cache = queryCache;
    this.useStore = useStore;

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
    operation: OperationDescriptor<TQuery>
  ): InfiniteQueryKey<TQuery> {
    return [
      operation.request.node.params.name,
      operation.request.variables ?? {},
    ] as any;
  }

  buildOperation<TQuery extends Query>(
    node: ConcreteRequest,
    variables: Variables<TQuery>
  ) {
    return createOperation(node, variables) as OperationDescriptor<TQuery>;
  }

  buildSubscription<TQuery extends Query>(
    operation: OperationDescriptor<TQuery>,
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
    operation: OperationDescriptor<TQuery>
  ): QueryKey<TQuery> {
    return [
      operation.request.node.params.name,
      operation.request.variables ?? {},
    ];
  }

  async request<TQuery extends Query>(
    operation: OperationDescriptor<TQuery>
  ): Promise<FetchResult<TQuery>> {
    return await this.fetch<TQuery>({
      query: operation.request.node.params.text!,
      operationName: operation.request.node.params.name,
      operationKind: operation.request.node.params
        .operationKind as OperationKind,
      variables: operation.request.variables,
    });
  }

  async fetch<TQuery extends Query>({
    query,
    variables = {} as Variables<TQuery>,
    operationName = undefined,
    operationKind = "query",
  }: Omit<
    FetchOperation<Variables<TQuery>>,
    "endpoint" | "fetchOptions"
  >): Promise<FetchResult<TQuery>> {
    return await fetchGraphQL({
      endpoint: this.endpoint,
      query,
      variables,
      fetchOptions: this.fetchOptions,
      operationName,
      operationKind,
    });
  }

  async execute<TQuery extends Query>(
    operation: OperationDescriptor<TQuery>
  ): Promise<Response<TQuery>> {
    console.log(
      "🚀",
      operation.request.node.params.name,
      JSON.stringify(operation.request.variables)
    );
    const { data, error } = await this.request<TQuery>(operation);
    console.log(
      "📦",
      operation.request.node.params.name,
      JSON.stringify(operation.request.variables),
      ...[data && "success", error].filter(Boolean)
    );
    if (error) {
      throw error;
    }
    return data;
  }
}
