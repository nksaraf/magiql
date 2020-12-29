import { QueryObserver } from '../core';
import { UseQueryOptions, UseQueryResult } from './types';
export declare function useQueries<TData, TError>(queries: UseQueryOptions<TData, TError>[]): UseQueryResult<TData, TError>[];
export declare function useQueriesObserver<TData = unknown, TError = unknown>(queries: UseQueryOptions<TData, TError>[], Observer: typeof QueryObserver): UseQueryResult<TData, TError>[];
