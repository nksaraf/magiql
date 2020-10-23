import { QueryConfig } from "react-query";
import { Observable, SubscriptionClient } from "subscriptions-transport-ws";
import { resolveFetchOptions } from "../fetch/fetchGraphQL";
import {
  FetchOptions,
  QueryKey,
  Operation,
  Query,
  QueryCache,
  Response,
} from "../types";

export class GraphQLSubscriptionClient extends SubscriptionClient {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryCache: QueryCache;

  constructor({
    endpoint,
    fetchOptions,
  }: {
    endpoint: string;
    fetchOptions: FetchOptions<object>;
  }) {
    super(endpoint, {
      reconnect: true,
      connectionParams: async () => {
        return await resolveFetchOptions(fetchOptions, {
          operationKind: "subscription",
          endpoint: endpoint,
        });
      },
    });
    this.endpoint = endpoint;
    this.fetchOptions = fetchOptions;
  }

  getQueryKey<TQuery extends Query>(
    operation: Operation<TQuery>
  ): QueryKey<TQuery> {
    return [
      operation.request.node.params.name,
      operation.request.variables ?? {},
    ];
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
    const queryKey = this.getQueryKey(operation);
    const query = this.queryCache.buildQuery<Response<TQuery>, Error>(
      queryKey,
      {
        ...options,
        enabled: false,
      }
    );
    let subscription: {
      unsubscribe: () => void;
    } | null = null;

    return {
      query,
      unsubscribe() {
        subscription?.unsubscribe();
      },
      execute() {
        const observable = this.request({
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
}
