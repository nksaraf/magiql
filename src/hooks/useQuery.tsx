import {
  useQuery as useBaseQuery,
  QueryConfig,
  QueryResult,
} from "react-query";
import { getRequest, GraphQLTaggedNode } from "../graphql-tag";

import {
  Variables,
  Response,
  Query,
  Store,
  OperationDescriptor,
} from "../types";
import { useClient } from "./useClient";

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
  const store = client.useStore();
  const node = getRequest(query);
  const operation = client.buildOperation(node, variables);
  const queryKey = client.getQueryKey(operation);

  const baseQuery = useBaseQuery<Response<TQuery>, TError, typeof queryKey>(
    queryKey,
    async () => {
      const data = await client.request(operation);
      store.commit(operation, data);
      return data;
    },
    options
  );

  const data = store.useOperation(operation);

  return {
    ...baseQuery,
    data,
    client,
    operation,
    store,
  };
}
