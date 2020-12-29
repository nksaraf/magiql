import { QueryFunction, QueryKey } from '../core/types';
import { UseInfiniteQueryOptions, UseInfiniteQueryResult } from './types';
export declare function useInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(options: UseInfiniteQueryOptions<TQueryFnData, TError, TData>): UseInfiniteQueryResult<TData, TError>;
export declare function useInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, options?: UseInfiniteQueryOptions<TQueryFnData, TError, TData>): UseInfiniteQueryResult<TData, TError>;
export declare function useInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, queryFn: QueryFunction<TQueryFnData>, options?: UseInfiniteQueryOptions<TQueryFnData, TError, TData>): UseInfiniteQueryResult<TData, TError>;
