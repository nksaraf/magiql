import {
  useMutation as useBaseMutation,
  MutationConfig,
  MutateFunction,
  MutationResult,
} from "react-query";

import { getRequest, GraphQLTaggedNode } from "../core/graphql-tag";
import {
  GraphQLClient,
  Query,
  Variables,
  Response,
  Store,
  OperationDescriptor,
} from "../core/types";
import { useClient } from "./useClient";
import { useStore } from "./useStore";

export type UseMutationResult<TMutation extends Query, TError = Error> = [
  MutateFunction<Response<TMutation>, TError, Variables<TMutation>>,
  MutationResult<Response<TMutation>, TError> & {
    client: GraphQLClient;
    store: Store;
    operation: OperationDescriptor<TMutation>;
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
  const [mutateFn, state] = useBaseMutation<TData, TError, TVariables>(
    async (variables) => {
      const operation = client.buildOperation(node, variables);
      return await client.execute<TMutation>(operation);
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