import {
  useMutation as useBaseMutation,
  MutationConfig,
  MutateFunction,
  MutationResult,
} from "react-query";
import { createOperation } from "../operation/operation";
import { GraphQLClient } from "../client/client";

import {
  Query,
  Variables,
  Response,
  GraphQLTaggedNode,
  Operation,
  CombinedError,
  ResponseUpdaterConfig,
  RequestConfig,
} from "../types";
import { useGraphQLClient } from "./useGraphQLClient";

export type UseMutationResult<
  TMutation extends Query,
  TError = CombinedError
> = [
  MutateFunction<Response<TMutation>, TError, Variables<TMutation>>,
  MutationResult<Response<TMutation>, TError> & {
    client: GraphQLClient;
    operation: Operation<TMutation>;
  }
];

export interface UseMutationOptions<
  TMutation extends Query,
  TError = CombinedError
> extends MutationConfig<Response<TMutation>, TError, Variables<TMutation>>,
    ResponseUpdaterConfig<TMutation>,
    RequestConfig<TMutation> {
  invalidateQueries?: any[];
}

export function useMutation<TMutation extends Query, TError = CombinedError>(
  mutation: GraphQLTaggedNode | string,
  options: UseMutationOptions<TMutation, TError> = {}
): UseMutationResult<TMutation, TError> {
  const {
    onSuccess,
    invalidateQueries = [],
    fetchOptions = {},
    optimisticResponse,
    optimisticUpdater,
    updater,
    onMutate,
    ...mutationOptions
  } = options;
  type TData = Response<TMutation>;
  type TVariables = Variables<TMutation>;
  const client = useGraphQLClient();
  const [mutateFn, state] = useBaseMutation<TData, TError, TVariables>(
    (variables) => {
      const operation = client.createOperation<TMutation>(mutation, {
        variables,
        fetchOptions,
        optimisticResponse,
        optimisticUpdater,
        updater,
      });
      return client.execute<TMutation>(operation).then(({ data }) => data);
    },
    {
      ...mutationOptions,
      onSuccess: (data, variables) => {
        onSuccess?.(data, variables);
        for (var query of invalidateQueries) {
          client.queryCache.invalidateQueries(query);
        }
      },
    }
  );

  return [
    mutateFn,
    {
      ...state,
      client,
      operation: client.createOperation(mutation, {
        fetchOptions,
        variables: {},
      }),
    },
  ];
}
