import {
  useQuery as useBaseQuery,
  QueryConfig,
  QueryResult,
} from "react-query";

import { getRequest, GraphQLTaggedNode } from "../core/graphql-tag";
import {
  Variables,
  Response,
  Query,
  Store,
  OperationDescriptor,
} from "../core/types";
import { useClient } from "./useClient";
import { useStore } from "./useStore";

export interface UseQueryOptions<TQuery extends Query, TError = Error>
  extends QueryConfig<Response<TQuery>, TError> {
  variables?: Variables<TQuery>;
  operationName?: string;
}

export type UseQueryResult<TQuery extends Query, TError> = QueryResult<
  Response<TQuery>,
  TError
> & {
  client: ReturnType<typeof useClient>;
  store: Store;
  operation: OperationDescriptor<TQuery>;
};

export function useQuery<TQuery extends Query, TError = Error>(
  query: GraphQLTaggedNode | string,
  {
    variables = {} as Variables<TQuery>,
    ...options
  }: UseQueryOptions<TQuery, TError> = {}
): UseQueryResult<TQuery, TError> {
  const client = useClient();
  const store = useStore();
  const node = getRequest(query);
  const operation = client.buildOperation(node, variables);
  const queryKey = client.getQueryKey(operation);

  const baseQuery = useBaseQuery<Response<TQuery>, TError, typeof queryKey>(
    queryKey,
    async () => {
      const data = await client.execute(operation);
      console.log(data);
      store.commit(operation, data);
      return data;
    },
    options
  );

  const data = store.useOperation(operation);

  return {
    ...baseQuery,
    data: baseQuery.status === "loading" ? null : data,
    client,
    operation,
    store,
  };
}
