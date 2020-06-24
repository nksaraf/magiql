import React from "react";
import {
  useQuery as useBaseQuery,
  QueryOptions,
  QueryResult,
  useMutation as useBaseMutation,
  MutationOptions,
  MutationResult,
  MutateFunction,
} from "react-query";
import { Middleware } from "./fetch";
import { useClient } from "./client";

export interface GraphQLVariables<TVariables> {
  variables?: TVariables;
}

export interface UseQueryOptions<TData, TVariables, TError = Error>
  extends QueryOptions<TData, TError>,
    GraphQLVariables<TVariables> {
  middleware?: Middleware<TData, TVariables>[];
  operationName?: string;
}

export type UseQueryResult<TData, TError> = QueryResult<TData, TError>;
export type UseMutationResult<TData, TVariables, TError> = [
  MutateFunction<TData, TVariables, TError>,
  MutationResult<TData, TError>
];

export const getOperationName = (query: string) => {
  const name = /(query|mutation|subscription) ([\w\d-_]+)/.exec(query);
  return name && name.length && name[2] ? name[2] : query;
};

type GraphqlQueryKey<TVariables> = [string, GraphQLVariables<TVariables>];

export function useQuery<TData, TVariables extends object, TError = Error>(
  query: string,
  {
    variables = {} as TVariables,
    middleware = [],
    operationName = getOperationName(query),
    ...options
  }: UseQueryOptions<TData, TVariables, TError> = {}
): UseQueryResult<TData, TError> {
  const client = useClient<TData, TVariables>();
  const key: GraphqlQueryKey<TVariables> = [operationName, { variables }];
  return useBaseQuery<TData, GraphqlQueryKey<TVariables>, TError>(
    key,
    async (queryKey, { variables }) => {
      return await client.fetch(query, variables, middleware);
    },
    options
  );
}

export function useMountedCallback(callback: any) {
  const mounted = React.useRef(false);

  React[typeof window === "undefined" ? "useEffect" : "useLayoutEffect"](() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return React.useCallback(
    (...args) => (mounted.current ? callback(...args) : void 0),
    [callback]
  );
}

export function useSubscrition<
  TData,
  TVariables extends object,
  TError = Error
>(
  subscription: string,
  {
    variables = {} as TVariables,
    operationName = getOperationName(subscription),
    ...options
  }: UseQueryOptions<TData, TVariables, TError> = {}
): UseQueryResult<TData, TError> {
  const rerender = useMountedCallback(React.useState()[1]);

  const client = useClient();

  const query = (client.cache as any).buildQuery(
    [operationName, { variables: variables }],
    () => new Promise(() => {}),
    options
  );

  const instanceRef = React.useRef();

  React.useEffect(() => {
    if (!client.subscriptionClient) {
      return;
    }

    instanceRef.current = query.subscribe(() => rerender({}));

    const observable = client.subscriptionClient.request({
      query: subscription,
      variables: variables,
    });

    const sub = observable.subscribe({
      next: (result) => {
        query.setData(result.data);
      },
      error: (error) => {
        query.setState((state: any) => ({
          ...state,
          status: "error",
          isError: true,
          isFetching: false,
          isStale: true,
          error,
        }));
        sub.unsubscribe();
      },
      complete: () => {
        sub.unsubscribe();
      },
    });
    return () => {
      (instanceRef.current as any).unsubscribe();
      sub.unsubscribe();
    };
  }, [query, rerender]);

  return {
    query,
    ...query.state,
  };
}

export interface UseMutationOptions<TData, TVariables, TError = Error>
  extends MutationOptions<TData, GraphQLVariables<TVariables>, TError> {
  middleware?: Middleware<TData, TVariables>[];
  operationName?: string;
}

export function useMutation<TData, TVariables extends object, TError>(
  mutation: string,
  {
    middleware = [],
    operationName = getOperationName(mutation),
    ...options
  }: UseMutationOptions<TData, TVariables, TError> = {}
): UseMutationResult<TData, TVariables, TError> {
  const client = useClient<TData, TVariables>();
  return useBaseMutation<TData, TVariables, TError>(async (variables) => {
    return await client.fetch(mutation, variables, middleware);
  }, options);
}

// export async function prefetchGraphQLQuery<TData, TVariables extends object>(
//   query: string,
//   {
//     variables = {} as TVariables,
//     middleware = [],
//     uri = "/api",
//     opName = query,
//     skip = false,
//     ...options
//   }: UseQueryOptions<TData, TVariables> & { uri?: string } = {}
// ): Promise<{ data?: TData; error?: any } | undefined> {
//   const key: any = [opName, ...(skip ? [undefined] : [{ variables }])];
//   return await queryCache.prefetchQuery<TData, GraphQLVariables<TVariables>>(
//     key,
//     (async (queryKey: string, { variables }: GraphQLVariables<TVariables>) => {
//       console.log(`fetching ${queryKey}...`);
//       // console.log(graphQLCxlient);
//       try {
//         const result = await fetchGraphQL(url, query, variables, {
//           middleware
//         });
//         return { data: result, error: undefined };
//       } catch (e) {
//         return { data: undefined, error: e };
//       }
//     }) as any,
//     {
//       ...options
//     } as QueryOptions<TData>
//   );
// }
