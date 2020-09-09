import React from "react";
import {
  useInfiniteQuery as useBaseInfiniteQuery,
  InfiniteQueryConfig,
  InfiniteQueryResult,
  QueryConfig,
} from "react-query";

import { getRequest, GraphQLTaggedNode } from "../core/graphql-tag";
import {
  GraphQLClient,
  Variables,
  Response,
  OperationDescriptor,
  Query,
  InfiniteQueryKey,
  Store,
} from "../core/types";
import { useClient } from "./useClient";
import { useStore } from "./useStore";

export interface UseInfiniteQueryOptions<TQuery extends Query, TError = Error>
  extends InfiniteQueryConfig<Response<TQuery>, TError> {
  variables?: Variables<TQuery>;
  operationName?: string;
}

export type UseInfiniteQueryResult<
  TQuery extends Query,
  TError
> = InfiniteQueryResult<Response<TQuery>, TError> & {
  client: GraphQLClient;
  store: Store;
  operation: OperationDescriptor<TQuery>;
};

function getLastPage<TResult>(pages: TResult[], previous?: boolean): TResult {
  return previous ? pages[0] : pages[pages.length - 1];
}

function hasMorePages<TResult, TError>(
  config: QueryConfig<TResult, TError>,
  pages: unknown,
  previous?: boolean
): boolean | undefined {
  if (config.infinite && config.getFetchMore && Array.isArray(pages)) {
    return Boolean(config.getFetchMore(getLastPage(pages, previous), pages));
  }
}

export function useInfiniteQuery<TQuery extends Query, TError = Error>(
  query: GraphQLTaggedNode | string,
  {
    variables = {} as Variables<TQuery>,
    ...options
  }: UseInfiniteQueryOptions<TQuery, TError>
): UseInfiniteQueryResult<TQuery, TError> {
  type TData = Response<TQuery>;
  const client = useClient();
  const node = getRequest(query);
  const operation = client.buildOperation(node, variables);
  const store = useStore();

  const queryKey = client.getInfinteQueryKey(operation);
  const infiniteQuery = useBaseInfiniteQuery<TData, TError, typeof queryKey>(
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

  const pageQueries = infiniteQuery.data?.map((page, index) => {
    if (index === 0) return variables;
    const fetchMoreVariable: any = options.getFetchMore(
      infiniteQuery.data[index - 1],
      infiniteQuery.data
    );
    return {
      ...variables,
      ...fetchMoreVariable,
    };
  }) ?? [variables];

  console.log(pageQueries);
  // const data = store.useOperation(operation);
  const data = store.useOperationPages(operation, pageQueries);

  const { canFetchMore, fetchMore: baseFetchMore } = infiniteQuery;

  const fetchMore = React.useCallback(
    async (variables, options) => {
      if (canFetchMore) {
        return await baseFetchMore(variables, options);
      }
    },
    [canFetchMore, baseFetchMore]
  );

  return {
    ...infiniteQuery,
    data,
    operation,
    client,
    canFetchMore,
    fetchMore,
    store,
  };
}
