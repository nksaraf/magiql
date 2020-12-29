import {
  GQLQueryObserver,
  GQLQueryObserverOptions,
} from './core/gqlQueryObserver';
import { useMutationObserver, useQueryObserver } from 'react-query';
import {
  FragmentData,
  FragmentRef,
  GraphQLTaggedNode,
  Query,
  Response,
  Variables,
} from './core/types';

import {
  GQLFragmentObserver,
  GQLFragmentObserverOptions,
} from './core/gqlFragmentObserver';
import { UseBaseQueryResult } from 'react-query';
import { CombinedError } from './core/error';
import {
  GQLMutationObserver,
  GQLMutationObserverOptions,
} from './core/gqlMutationObserver';
import { UseMutationResult } from 'react-query';

export function useQuery<
  TQuery extends Query,
  TError = CombinedError,
  TData = Response<TQuery>,
  TQueryData = Response<TQuery>
>(
  query: string | GraphQLTaggedNode,
  options?: GQLQueryObserverOptions<TQuery, TError, TData, TQueryData>,
): UseBaseQueryResult<Response<TQuery>, TError> {
  return useQueryObserver(
    {
      query: query,
      ...(options ?? {}),
    },
    GQLQueryObserver,
  );
}

export function useFragment<
  TFragmentRef extends FragmentRef,
  TError = CombinedError
>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TFragmentRef,
  options: GQLFragmentObserverOptions<TFragmentRef, TError> = {},
): FragmentData<TFragmentRef> {
  const fragmentQuery = useQueryObserver(
    {
      fragment: fragmentNode,
      fragmentRef,
      ...options,
    },
    GQLFragmentObserver,
  );

  return fragmentQuery.data;
}

export function useMutation<
  TMutation extends Query,
  TError = CombinedError,
  TContext = any
>(
  mutation: GraphQLTaggedNode | string,
  options: Omit<
    GQLMutationObserverOptions<TMutation, TError, TContext>,
    'mutation'
  >,
): UseMutationResult<
  Response<TMutation>,
  TError,
  Variables<TMutation>,
  TContext
> {
  return useMutationObserver(
    {
      mutation,
      ...options,
    } as any,
    GQLMutationObserver,
  );
}
