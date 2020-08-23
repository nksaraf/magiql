import React from "react";
import {
  useInfiniteQuery as useBaseInfiniteQuery,
  InfiniteQueryConfig,
  InfiniteQueryResult,
} from "react-query";

import { getRequest, GraphQLTaggedNode } from "../graphql-tag";
import {
  GraphQLClient,
  Variables,
  Response,
  OperationDescriptor,
  Query,
  QueryStatus,
  InfiniteQueryKey,
  Store,
} from "../types";
import { createState, Stated } from "../utils";
import { useClient } from "./useClient";

export interface UseInfiniteQueryOptions<TQuery extends Query, TError = Error>
  extends InfiniteQueryConfig<Response<TQuery>, TError> {
  variables?: Variables<TQuery>;
  operationName?: string;
}

export type UseInfiniteQueryResult<TQuery extends Query, TError> = Omit<
  InfiniteQueryResult<Response<TQuery>, TError>,
  "status"
> & {
  status: Stated<QueryStatus>;
  client: GraphQLClient;
  store: Store;
  operation: OperationDescriptor<TQuery>;
};

export function useInfiniteQuery<TQuery extends Query, TError = Error>(
  query: GraphQLTaggedNode,
  {
    variables = {} as Variables<TQuery>,
    ...options
  }: UseInfiniteQueryOptions<TQuery, TError>
): UseInfiniteQueryResult<TQuery, TError> {
  type TData = Response<TQuery>;
  const client = useClient();
  const node = getRequest(query);
  const operation = client.buildOperation(node, variables);
  const store = client.useStore();
  const queryKey = client.getInfinteQueryKey(operation);
  const baseQuery = useBaseInfiniteQuery<TData, TError, typeof queryKey>(
    queryKey,
    async (queryKey, variables = {}, fetchMoreVariables) => {
      const fetchMoreOperation = client.buildOperation(node, {
        ...variables,
        ...(fetchMoreVariables ?? {}),
      });

      const data = await client.execute(fetchMoreOperation);
      store.commit(fetchMoreOperation, data);
      return data;
    },
    options
  );

  // const data = store.useOperation(operation);
  const data = store.useOperationPages(
    operation,
    (baseQuery.query as any).pageVariables.map(
      ([key, variables, fetchMore = {}]: InfiniteQueryKey<Query>) => ({
        ...variables,
        ...fetchMore,
      })
    )
  );

  const { canFetchMore, fetchMore: baseFetchMore } = baseQuery;

  const fetchMore = React.useCallback(
    async (variables, options) => {
      if (canFetchMore) {
        return await baseFetchMore(variables, options);
      }
    },
    [canFetchMore, baseFetchMore]
  );

  return {
    ...baseQuery,
    data,
    operation,
    client,
    canFetchMore,
    fetchMore,
    store,
    status: createState(baseQuery.status as QueryStatus),
  };
}
