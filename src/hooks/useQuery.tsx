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
  QueryStatus,
  Store,
  OperationDescriptor,
} from "../types";
import { createState, Stated } from "../utils";
import { useClient } from "./useClient";

export interface UseQueryOptions<TQuery extends Query, TError = Error>
  extends QueryConfig<Response<TQuery>, TError> {
  variables?: Variables<TQuery>;
  operationName?: string;
}

export type UseQueryResult<TQuery extends Query, TError> = Omit<
  QueryResult<Response<TQuery>, TError>,
  "status"
> & {
  status: Stated<QueryStatus>;
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

  const snapshot = store.useOperation(operation);

  return {
    ...baseQuery,
    data: snapshot,
    client,
    operation,
    store,
    status: createState(baseQuery.status as QueryStatus),
  };
}
