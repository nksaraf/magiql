import {
  useMutation as useBaseMutation,
  MutationConfig,
  MutateFunction,
  MutationResult,
} from "react-query";
import { createOperation } from "../core/operation/operation";
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
} from "../core/types";
import { useGraphQLClient } from "./useGraphQLClient";
import { useGraphQLStore } from "./useGraphQLStore";

export type UseMutationResult<
  TMutation extends Query,
  TError = CombinedError
> = [
  MutateFunction<Response<TMutation>, TError, Variables<TMutation>>,
  MutationResult<Response<TMutation>, TError> & {
    client: GraphQLClient;
    store: Store;
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
  const store = useGraphQLStore();
  const execute = client.useExecutor();
  const [mutateFn, state] = useBaseMutation<TData, TError, TVariables>(
    (variables) => {
      const operation = client.buildOperation(mutation, {
        variables,
        fetchOptions,
      });
      return execute<TMutation>(operation).then(({ data }) => data);
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

          store.update(normalizedData);
        }
      },
      onSuccess: (data, variables) => {
        onSuccess?.(data, variables);
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
      operation: client.buildOperation(mutation, {
        fetchOptions,
        variables: {},
      }),
    },
  ];
}
