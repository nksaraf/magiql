import { QueryFunction, QueryKey } from '../core/types';
import { UseQueryOptions, UseQueryResult } from './types';
export declare function useQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(options: UseQueryOptions<TQueryFnData, TError, TData>): UseQueryResult<TData, TError>;
export declare function useQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, options?: UseQueryOptions<TQueryFnData, TError, TData>): UseQueryResult<TData, TError>;
export declare function useQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, queryFn: QueryFunction<TQueryFnData>, options?: UseQueryOptions<TQueryFnData, TError, TData>): UseQueryResult<TData, TError>;
