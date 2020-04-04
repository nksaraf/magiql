import {
  useQuery as useBaseQuery,
  QueryOptions,
  QueryResult,
  useMutation as useBaseMutation,
  MutationOptions,
  MutationResult,
  MutateFunction,
} from "react-query";
import { Middleware } from "./graphql-fetch";
import { useMagiqlClient } from "./client";

interface GraphQLVariables<TVariables> {
  variables?: TVariables;
}

export interface UseQueryOptions<TData, TVariables>
  extends QueryOptions<TData>,
    GraphQLVariables<TVariables> {
  middleware?: Middleware[];
  skip?: boolean;
  opName?: string;
}

export interface UseQueryResult<TData, TVariables>
  extends QueryResult<TData, TVariables> {
  loading?: boolean;
}

export const getOpName = (query: string) => {
  const name = /(query|mutation) ?([\w\d-_]+)? ?\(.*?\)? \{/.exec(query);
  return name && name.length && name[2] ? name[2] : query;
};

export function useQuery<TData, TVariables extends object>(
  query: string,
  {
    variables = {} as TVariables,
    middleware = [],
    opName = getOpName(query),
    skip = false, // to lazily evaluate query
    ...options
  }: UseQueryOptions<TData, TVariables> = {}
): UseQueryResult<TData, GraphQLVariables<TVariables>> {
  const client = useMagiqlClient();
  const key: any = [opName, ...(skip ? [false] : [{ variables }])];
  const { status, ...queryObject } = useBaseQuery<
    TData,
    GraphQLVariables<TVariables>
  >(
    key,
    (async (queryKey: string, { variables }: GraphQLVariables<TVariables>) => {
      return await client.fetch(query, variables, middleware);
    }) as any,
    {
      ...options,
    } as QueryOptions<TData>
  );

  return {
    loading: status === "loading",
    status,
    ...queryObject,
  };
}

export interface UseMutationOptions<TData, TVariables>
  extends MutationOptions<TData> {
  middleware?: Middleware[];
  opName?: string;
}

export interface UseMutationResult<TData, TVariables>
  extends MutationResult<TData> {
  loading?: boolean;
}

export function useMutation<TData, TVariables extends object>(
  mutation: string,
  {
    middleware = [],
    opName = getOpName(mutation),
    ...options
  }: UseMutationOptions<TData, TVariables> = {}
): [MutateFunction<TData, TVariables>, UseMutationResult<TData, TVariables>] {
  const client = useMagiqlClient();
  const [mutate, { status, ...mutationObject }] = useBaseMutation<
    TData,
    TVariables
  >(async (variables: any) => {
    return await client.fetch(mutation, variables, middleware);
  }, options);

  return [
    mutate,
    {
      loading: status === "loading",
      status,
      ...mutationObject,
    },
  ];
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
