import {
  useQuery as useBaseQuery,
  QueryOptions,
  QueryResult,
} from "react-query";
import { useClient } from "./client";
import { getOperationName, GraphqlQueryKey, GraphQLVariables } from "./utils";
import { OperationType } from "./fetch";

export interface UseQueryOptions<TData, TVariables, TError = Error>
  extends QueryOptions<TData, TError>,
    GraphQLVariables<TVariables> {
  operationName?: string;
}

export type UseQueryResult<TData, TError> = QueryResult<TData, TError>;

export function useQuery<TData, TVariables extends object, TError = Error>(
  query: string,
  {
    variables = {} as TVariables,
    operationName = getOperationName(query),
    ...options
  }: UseQueryOptions<TData, TVariables, TError> = {}
): UseQueryResult<TData, TError> {
  const client = useClient<TData, TVariables>();
  const key: GraphqlQueryKey<TVariables> = [operationName, { variables }];
  return useBaseQuery<TData, GraphqlQueryKey<TVariables>, TError>(
    key,
    async (queryKey, { variables }) => {
      return await client.fetch({
        query,
        variables,
        operationName,
        operationType: OperationType.Query,
      });
    },
    options
  );
}
