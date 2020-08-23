import { queryCache } from "react-query";
import { SubscriptionClient } from "subscriptions-transport-ws";

import { fetchGraphQL, resolveFetchOptions } from "./fetch";
import { createOperation } from "./graphql-tag";
import { createQueryCacheStore } from "./store/cacheStore";
import {
  FetchOperation,
  GraphQLClient,
  OperationKind,
  OperationDescriptor,
  QueryKey,
  InfiniteQueryKey,
  Query,
  Variables,
  Response,
  ConcreteRequest,
} from "./types";

export function createClient({
  endpoint = "/graphql",
  fetchOptions = () => {
    return {};
  },
  cache = queryCache,
  subscriptions = undefined,
  queryConfig = {},
  useStore = createQueryCacheStore(),
  fetch = async <TQuery extends Query>({
    query,
    variables = {} as Variables<TQuery>,
    operationName = undefined,
    operationKind = "query",
  }: FetchOperation<Variables<TQuery>>): Promise<Response<TQuery>> => {
    return await fetchGraphQL({
      endpoint,
      query,
      variables,
      fetchOptions,
      operationName,
      operationKind,
    });
  },
}: Partial<GraphQLClient> = {}): GraphQLClient {
  if (subscriptions && typeof window !== "undefined") {
    const {
      endpoint: subscriptionEndpoint = endpoint,
      fetchOptions: subscriptionFetchOptions = fetchOptions,
      client = new SubscriptionClient(subscriptionEndpoint, {
        reconnect: true,
        connectionParams: () => {
          return resolveFetchOptions(subscriptionFetchOptions, {
            operationKind: "subscription",
            endpoint: subscriptionEndpoint,
          });
        },
      }),
    } = subscriptions;

    subscriptions = {
      client,
      endpoint: subscriptionEndpoint,
      fetchOptions: subscriptionFetchOptions,
    };
  }

  function buildSubscription<TQuery extends Query>(
    operation: OperationDescriptor<TQuery>,
    options: any
  ) {
    if (!subscriptions) {
      throw new Error("No subscription client found!");
    }
    const queryKey = getQueryKey(operation);
    const query = cache.buildQuery<Response<TQuery>, Error>(queryKey, {
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
        const observable = subscriptions?.client.request({
          query: (operation.request.node as any).query,
          variables: operation.request.variables,
          operationName: operation.request.node.operation.name,
        });

        if (!observable) {
          throw new Error("No subscription client found!");
        }

        subscription = observable.subscribe({
          next: (result) => {
            query.setData(result.data);
          },
          error: (error) => {
            // @ts-ignore
            query.setState((state: any) => ({
              ...state,
              status: "error",
              isError: true,
              isFetching: false,
              isStale: true,
              error,
            }));
            subscription?.unsubscribe();
          },
          complete: () => {
            subscription?.unsubscribe();
          },
        });
      },
    };
  }

  async function request<TQuery extends Query>(
    operation: OperationDescriptor<TQuery>
  ): Promise<Response<TQuery>> {
    const data = await fetch<TQuery>({
      query: (operation.request.node as any).query,
      operationName: operation.request.node.operation.name,
      operationKind: operation.request.node.params
        .operationKind as OperationKind,
      variables: operation.request.variables,
    });
    return data;
  }

  function getQueryKey<TQuery extends Query>(
    operation: OperationDescriptor<TQuery>
  ): QueryKey<TQuery> {
    return [
      operation.request.node.operation.name,
      operation.request.variables ?? {},
    ];
  }

  function getInfinteQueryKey<TQuery extends Query>(
    operation: OperationDescriptor<TQuery>
  ): InfiniteQueryKey<TQuery> {
    return [
      operation.request.node.operation.name,
      operation.request.variables ?? {},
    ] as any;
  }

  function buildOperation<TQuery extends Query>(
    node: ConcreteRequest | string,
    variables: Variables<TQuery>
  ) {
    return createOperation(node, variables) as OperationDescriptor<TQuery>;
  }

  return {
    endpoint,
    fetchOptions,
    cache,
    useStore,
    request,
    getQueryKey,
    getInfinteQueryKey,
    queryConfig,
    buildSubscription,
    fetch,
    buildOperation,
  };
}
