import {
  useMutation as useBaseMutation,
  MutationOptions,
  MutateFunction,
  MutationResult,
} from "react-query";
import { useClient } from "./client";
import { getOperationName, GraphQLVariables } from "./utils";
import { OperationType } from "./fetch";

export type UseMutationResult<TData, TVariables, TError> = [
  MutateFunction<TData, TVariables, TError>,
  MutationResult<TData, TError>
];

export interface UseMutationOptions<TData, TVariables, TError = Error>
  extends MutationOptions<TData, GraphQLVariables<TVariables>, TError> {
  operationName?: string;
}

export function useMutation<TData, TVariables extends object, TError>(
  mutation: string,
  {
    operationName = getOperationName(mutation),
    ...options
  }: UseMutationOptions<TData, TVariables, TError> = {}
): UseMutationResult<TData, TVariables, TError> {
  const client = useClient<TData, TVariables>();
  return useBaseMutation<TData, TVariables, TError>(async (variables) => {
    return await client.fetch({
      query: mutation,
      variables,
      operationName,
      operationType: OperationType.Mutation,
    });
  }, options);
}
