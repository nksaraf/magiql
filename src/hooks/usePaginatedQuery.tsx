import React from "react";
import {
  usePaginatedQuery as useBasePaginatedQuery,
  PaginatedQueryResult,
  QueryConfig,
} from "react-query";

import { getRequest } from "../core/operation";
import {
  Variables,
  Response,
  Query,
  QueryStatus,
  Store,
  GraphQLTaggedNode,
  Operation,
  FetchOptions,
} from "../core/types";
import { useGraphQLClient } from "./useGraphQLClient";
import { useGraphQLStore } from "./useGraphQLStore";

export interface UsePaginatedQueryOptions<TQuery extends Query, TError = Error>
  extends QueryConfig<Response<TQuery>, TError> {
  variables?: Variables<TQuery>;
  operationName?: string;
  fetchOptions?: FetchOptions<Variables<TQuery>>;
}

export type UsePaginatedQueryResult<
  TQuery extends Query,
  TError
> = PaginatedQueryResult<Response<TQuery>, TError> & {
  client: ReturnType<typeof useGraphQLClient>;
  store: Store;
  resolvedOperation: Operation<TQuery>;
  latestOperation: Operation<TQuery>;
};

export function usePaginatedQuery<TQuery extends Query, TError = Error>(
  query: GraphQLTaggedNode | string,
  {
    variables = {} as Variables<TQuery>,
    fetchOptions = {},
    ...options
  }: UsePaginatedQueryOptions<TQuery, TError> = {}
): UsePaginatedQueryResult<TQuery, TError> {
  type TData = Response<TQuery>;
  const node = getRequest(query);
  const client = useGraphQLClient();
  const store = useGraphQLStore();
  const variablesRef = React.useRef(variables);
  const latestOperation = client.buildOperation(node, variables, fetchOptions);
  const queryKey = client.getQueryKey(latestOperation);
  const execute = client.useExecutor();
  const { resolvedData, latestData, ...baseQuery } = useBasePaginatedQuery<
    TData,
    TError,
    typeof queryKey
  >(
    queryKey,
    async () => {
      const { data } = await execute(latestOperation);
      return data;
    },
    options
  );
  if (latestData) {
    variablesRef.current = variables;
  }

  const resolvedOperation = client.buildOperation(
    node,
    variablesRef.current,
    fetchOptions
  );

  const resolvedSnapshot = store.useOperation(resolvedOperation);
  return {
    resolvedData: resolvedSnapshot,
    latestData: latestData ? resolvedSnapshot.data : null,
    ...baseQuery,
    resolvedOperation,
    latestOperation,
    client,
    store,
  };
}
