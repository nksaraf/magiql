import React from "react";
import {
  usePaginatedQuery as useBasePaginatedQuery,
  PaginatedQueryResult,
  QueryConfig,
} from "react-query";

import { getRequest, GraphQLTaggedNode } from "../core/graphql-tag";
import {
  Variables,
  Response,
  Query,
  QueryStatus,
  Store,
  OperationDescriptor,
} from "../core/types";
import { useClient } from "./useClient";
import { useStore } from "./useStore";

export interface UsePaginatedQueryOptions<TQuery extends Query, TError = Error>
  extends QueryConfig<Response<TQuery>, TError> {
  variables?: Variables<TQuery>;
  operationName?: string;
}

export type UsePaginatedQueryResult<
  TQuery extends Query,
  TError
> = PaginatedQueryResult<Response<TQuery>, TError> & {
  client: ReturnType<typeof useClient>;
  store: Store;
  resolvedOperation: OperationDescriptor<TQuery>;
  latestOperation: OperationDescriptor<TQuery>;
};

export function usePaginatedQuery<TQuery extends Query, TError = Error>(
  query: GraphQLTaggedNode | string,
  {
    variables = {} as Variables<TQuery>,
    ...options
  }: UsePaginatedQueryOptions<TQuery, TError> = {}
): UsePaginatedQueryResult<TQuery, TError> {
  type TData = Response<TQuery>;
  const node = getRequest(query);
  const client = useClient();
  const store = useStore();
  const variablesRef = React.useRef(variables);
  const latestOperation = client.buildOperation(node, variables);
  const queryKey = client.getQueryKey(latestOperation);
  const { resolvedData, latestData, ...baseQuery } = useBasePaginatedQuery<
    TData,
    TError,
    typeof queryKey
  >(
    queryKey,
    async () => {
      const data = await client.execute(latestOperation);
      store.commit(latestOperation, data);
      return data;
    },
    options
  );
  if (latestData) {
    variablesRef.current = variables;
  }

  const resolvedOperation = client.buildOperation(node, variablesRef.current);

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
