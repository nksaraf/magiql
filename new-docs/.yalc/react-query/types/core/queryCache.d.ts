import { QueryFilters } from './utils';
import { Query, QueryState } from './query';
import type { QueryKey, QueryOptions } from './types';
import type { QueryClient } from './queryClient';
import { Subscribable } from './subscribable';
interface QueryCacheConfig {
    onError?: (error: unknown, query: Query<unknown, unknown, unknown>) => void;
}
declare type QueryCacheListener = (query?: Query) => void;
export declare class QueryCache extends Subscribable<QueryCacheListener> {
    config: QueryCacheConfig;
    private queries;
    private queriesMap;
    constructor(config?: QueryCacheConfig);
    build<TQueryFnData, TError, TData>(client: QueryClient, options: QueryOptions<TQueryFnData, TError, TData>, state?: QueryState<TData, TError>): Query<TQueryFnData, TError, TData>;
    add(query: Query<any, any>): void;
    remove(query: Query<any, any>): void;
    clear(): void;
    get<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryHash: string): Query<TQueryFnData, TError, TData> | undefined;
    getAll(): Query[];
    find<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(arg1: QueryKey, arg2?: QueryFilters): Query<TQueryFnData, TError, TData> | undefined;
    findAll(queryKey?: QueryKey, filters?: QueryFilters): Query[];
    findAll(filters?: QueryFilters): Query[];
    findAll(arg1?: QueryKey | QueryFilters, arg2?: QueryFilters): Query[];
    notify(query?: Query<any, any>): void;
    onFocus(): void;
    onOnline(): void;
}
export {};
