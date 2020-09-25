import {
  useMutation as useBaseMutation,
  MutationConfig,
  MutateFunction,
  MutationResult,
} from "react-query";
import { GraphQLClient } from "../core/client";

import { getRequest } from "../core/graphql-tag";
import {
  Query,
  Variables,
  Response,
  Store,
  GraphQLTaggedNode,
  Operation,
} from "../core/types";
import { useClient } from "./useClient";
import { useStore } from "./useStore";

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
}

export function useMutation<TMutation extends Query, TError = Error>(
  mutation: GraphQLTaggedNode | string,
  {
    onSuccess,
    invalidateQueries = [],
    ...options
  }: UseMutationOptions<TMutation, TError> = {}
): UseMutationResult<TMutation, TError> {
  type TData = Response<TMutation>;
  type TVariables = Variables<TMutation>;
  const client = useClient();
  const store = useStore();
  const node = getRequest(mutation);
  const execute = client.useExecutor();
  const [mutateFn, state] = useBaseMutation<TData, TError, TVariables>(
    (variables) => {
      const operation = client.buildOperation(node, variables);
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
          node,
          identifier: node.params.id,
          variables: {},
        },
      } as any,
    },
  ];
}
