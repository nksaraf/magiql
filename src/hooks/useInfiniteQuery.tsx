import React from "react";
import {
  useInfiniteQuery as useBaseInfiniteQuery,
  InfiniteQueryConfig,
  InfiniteQueryResult,
  QueryConfig,
} from "react-query";

import { GraphQLClient } from "../client/client";
import {
  Variables,
  Response,
  Operation,
  Query,
  GraphQLTaggedNode,
  Store,
  FetchOptions,
  CombinedError,
  RequestConfig,
} from "../types";
import { useGraphQLClient } from "./useGraphQLClient";

export interface UseInfiniteQueryOptions<
  TQuery extends Query,
  TError = CombinedError
> extends InfiniteQueryConfig<Response<TQuery>, TError>,
    RequestConfig<TQuery> {
  variables?: Variables<TQuery>;
}

export type UseInfiniteQueryResult<
  TQuery extends Query,
  TError
> = InfiniteQueryResult<Response<TQuery>, TError> & {
  client: GraphQLClient;
  operation: Operation<TQuery>;
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

export function useInfiniteQuery<TQuery extends Query, TError = CombinedError>(
  query: GraphQLTaggedNode | string,
  options: UseInfiniteQueryOptions<TQuery, TError>
): UseInfiniteQueryResult<TQuery, TError> {
  const {
    variables = {} as Variables<TQuery>,
    fetchOptions = {},
    ...queryOptions
  } = options;
  type TData = Response<TQuery>;
  const client = useGraphQLClient();
  const operation = client.createOperation<TQuery>(query, {
    variables,
    fetchOptions,
  });

  const queryKey = client.getInfinteQueryKey(operation);
  const infiniteQuery = useBaseInfiniteQuery<TData, TError, typeof queryKey>(
    queryKey,
    (_, __, variables = {}, fetchMoreVariables) => {
      const fetchMoreOperation = client.createOperation<TQuery>(
        operation.request.node,
        {
          variables: {
            ...variables,
            ...(fetchMoreVariables ?? {}),
          },
          fetchOptions,
        }
      );

      return client.execute(fetchMoreOperation).then(({ data }) => {
        return data;
      });
    },
    queryOptions
  );

  const pageQueries = infiniteQuery.data?.map((page, index) => {
    if (index === 0) return variables;
    const fetchMoreVariable: any = options.getFetchMore?.(
      infiniteQuery.data![index - 1],
      infiniteQuery.data!
    );
    return {
      ...variables,
      ...fetchMoreVariable,
    };
  }) ?? [variables];

  const { data, isMissingData } = client.store.useOperationPages(
    operation,
    pageQueries
  );

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
    data: isMissingData ? undefined : data ?? undefined,
    operation,
    client,
    canFetchMore,
    fetchMore,
  };
}
