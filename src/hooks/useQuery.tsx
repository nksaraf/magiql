import {
  useQuery as useBaseQuery,
  QueryConfig,
  QueryResult,
} from "react-query";

import {
  Variables,
  Response,
  Query,
  Store,
  Operation,
  GraphQLTaggedNode,
  FetchOptions,
  CombinedError,
  RequestConfig,
} from "../types";
import { useGraphQLClient } from "./useGraphQLClient";
import { Client } from "../client/client";

export interface UseQueryOptions<TQuery extends Query, TError = CombinedError>
  extends QueryConfig<Response<TQuery>, TError>,
    RequestConfig<TQuery> {
  variables?: Variables<TQuery>;
}

export type UseQueryResult<TQuery extends Query, TError> = QueryResult<
  Response<TQuery>,
  TError
> & {
  client: Client;
  operation: Operation<TQuery>;
};

export function useQuery<TQuery extends Query, TError = CombinedError>(
  query: GraphQLTaggedNode | string,
  options: UseQueryOptions<TQuery, TError> = {}
): UseQueryResult<TQuery, TError> {
  const {
    variables = {} as Variables<TQuery>,
    fetchOptions = {},
    ...queryOptions
  } = options;
  const client = useGraphQLClient();
  const operation = client.createOperation<TQuery>(query, {
    variables,
    fetchOptions,
  });
  const queryKey = client.getQueryKey(operation);
  const { data, isMissingData } = client.store.useOperation(operation);
  const baseQuery = useBaseQuery<Response<TQuery>, TError, typeof queryKey>(
    queryKey,
    async () => {
      const { data } = await client.execute(operation);
      return data;
    },
    {
      ...queryOptions,
      initialData: !isMissingData ? data : undefined,
    }
  );

  return {
    ...baseQuery,
    data: isMissingData ? null : data,
    client,
    operation,
  };
}
