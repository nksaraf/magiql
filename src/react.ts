import {
  GQLQueryObserver,
  GQLQueryObserverOptions,
} from "./core/gqlQueryObserver";
import { useBaseMutation, useBaseQuery } from "react-query";
import { GraphQLTaggedNode, Query, Response } from "./types";

import { $Call, KeyType, KeyReturnType } from "./types";
import {
  GQLFragmentObserver,
  GQLFragmentObserverOptions,
} from "./core/gqlFragmentObserver";
import { UseBaseQueryResult } from "react-query";
import { CombinedError } from "./core/error";
import {
  GQLMutationObserver,
  GQLMutationObserverOptions,
} from "./core/gqlMutationObserver";
import { UseMutationResult } from "react-query";

export function useQuery<
  TQuery extends Query,
  TError = CombinedError,
  TData = Response<TQuery>,
  TQueryData = Response<TQuery>
>(
  query: string | GraphQLTaggedNode,
  options?: GQLQueryObserverOptions<TQuery, TError, TData, TQueryData>
): UseBaseQueryResult<Response<TQuery>, TError> {
  return useBaseQuery(
    {
      query: query,
      ...(options ?? {}),
    },
    GQLQueryObserver
  );
}

export function useFragment<TKey extends KeyType, TError = CombinedError>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TKey,
  options: GQLFragmentObserverOptions<TKey, TError> = {}
): TKey extends KeyType ? $Call<KeyReturnType<TKey>> : null {
  const fragmentQuery = useBaseQuery(
    {
      fragment: fragmentNode,
      fragmentRef,
      ...options,
    },
    GQLFragmentObserver
  );

  return fragmentQuery.data;
}

export function useMutation<
  TMutation extends Query,
  TError = CombinedError,
  TContext = any
>(
  mutation: GraphQLTaggedNode | string,
  options: GQLMutationObserverOptions<TMutation, TError, TContext>
): UseMutationResult {
  return useBaseMutation(
    {
      mutation,
      ...options,
    },
    GQLMutationObserver
  );
}
