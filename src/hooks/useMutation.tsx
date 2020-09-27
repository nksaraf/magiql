import {
  useMutation as useBaseMutation,
  MutationConfig,
  MutateFunction,
  MutationResult,
} from "react-query";
import { GraphQLClient } from "../core/graphQLClient";

import { getRequest } from "../core/operation";
import {
  Query,
  Variables,
  Response,
  Store,
  GraphQLTaggedNode,
  Operation,
  FetchOptions,
} from "../core/types";
import { useGraphQLClient } from "./useGraphQLClient";
import { useGraphQLStore } from "./useGraphQLStore";

export type UseMutationResult<TMutation extends Query, TError = Error> = [
  MutateFunction<Response<TMutation>, TError, Variables<TMutation>>,
  MutationResult<Response<TMutation>, TError> & {
    client: GraphQLClient;
    store: Store;
    operation: Operation<TMutation>;
  }
];

export interface UseMutationOptions<TMutation extends Query, TError = Error>
  extends MutationConfig<Response<TMutation>, TError, Variables<TMutation>> {
  operationName?: string;
  invalidateQueries?: any[];
  fetchOptions?: FetchOptions<Variables<TMutation>>;
}

export function useMutation<TMutation extends Query, TError = Error>(
  mutation: GraphQLTaggedNode | string,
  {
    onSuccess,
    invalidateQueries = [],
    fetchOptions = {},
    ...options
  }: UseMutationOptions<TMutation, TError> = {}
): UseMutationResult<TMutation, TError> {
  type TData = Response<TMutation>;
  type TVariables = Variables<TMutation>;
  const client = useGraphQLClient();
  const store = useGraphQLStore();
  const node = getRequest(mutation);
  const execute = client.useExecutor();
  const [mutateFn, state] = useBaseMutation<TData, TError, TVariables>(
    (variables) => {
      const operation = client.buildOperation(node, variables, fetchOptions);
      return execute<TMutation>(operation).then(({ data }) => data);
    },
    {
      ...options,
      onSuccess: (data, variables) => {
        if (onSuccess) {
          onSuccess(data, variables);
        }
        for (var query of invalidateQueries) {
          client.cache.invalidateQueries(query);
        }
      },
    }
  );

  return [
    mutateFn,
    {
      ...state,
      client,
      store,
      operation: {
        request: {
          fetchOptions: fetchOptions,
          node,
          identifier: node.params.id,
          variables: {},
        },
      } as any,
    },
  ];
}
