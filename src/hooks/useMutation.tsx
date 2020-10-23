import {
  useMutation as useBaseMutation,
  MutationConfig,
  MutateFunction,
  MutationResult,
} from "react-query";
import { createOperation } from "../operation/operation";
import { GraphQLClient } from "../core/graphQLClient";

import {
  Query,
  Variables,
  Response,
  Store,
  GraphQLTaggedNode,
  Operation,
  FetchOptions,
  CombinedError,
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
> extends MutationConfig<Response<TMutation>, TError, Variables<TMutation>> {
  operationName?: string;
  invalidateQueries?: any[];
  optimisticResponse?:
    | Response<TMutation>
    | ((variables: Variables<TMutation>) => Response<TMutation>);
  fetchOptions?: FetchOptions<Variables<TMutation>>;
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
    onMutate,
    ...mutationOptions
  } = options;
  type TData = Response<TMutation>;
  type TVariables = Variables<TMutation>;
  const client = useGraphQLClient();
  const [mutateFn, state] = useBaseMutation<TData, TError, TVariables>(
    (variables) => {
      const operation = client.createOperation(mutation, {
        variables,
        fetchOptions,
      });
      return client.execute<TMutation>(operation).then(({ data }) => data);
    },
    {
      ...mutationOptions,
      onMutate: (variables) => {
        onMutate?.(variables);
        if (optimisticResponse) {
          const operation = createOperation<TMutation>(mutation, { variables });
          const normalizedData = client.normalizer.normalizeResponse(
            typeof optimisticResponse === "object"
              ? optimisticResponse
              : (optimisticResponse as any)(variables),
            operation
          );

          client.store.update(normalizedData);
        }
      },
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
