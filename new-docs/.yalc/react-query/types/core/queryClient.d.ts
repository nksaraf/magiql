import { QueryFilters, Updater } from './utils';
import type { DefaultOptions, FetchInfiniteQueryOptions, FetchQueryOptions, InfiniteData, InvalidateOptions, InvalidateQueryFilters, MutationKey, MutationObserverOptions, MutationOptions, QueryFunction, QueryKey, QueryObserverOptions, QueryOptions, RefetchOptions, ResetOptions } from './types';
import type { QueryState, SetDataOptions } from './query';
import { QueryCache } from './queryCache';
import { MutationCache } from './mutationCache';
import { CancelOptions } from './retryer';
interface QueryClientConfig {
    queryCache?: QueryCache;
    mutationCache?: MutationCache;
    defaultOptions?: DefaultOptions;
}
export declare class QueryClient {
    private queryCache;
    private mutationCache;
    private defaultOptions;
    private queryDefaults;
    private mutationDefaults;
    private unsubscribeFocus?;
    private unsubscribeOnline?;
    constructor(config?: QueryClientConfig);
    mount(): void;
    unmount(): void;
    isFetching(filters?: QueryFilters): number;
    isFetching(queryKey?: QueryKey, filters?: QueryFilters): number;
    getQueryData<TData = unknown>(queryKey: QueryKey, filters?: QueryFilters): TData | undefined;
    setQueryData<TData>(queryKey: QueryKey, updater: Updater<TData | undefined, TData>, options?: SetDataOptions): TData;
    getQueryState<TData = unknown, TError = undefined>(queryKey: QueryKey, filters?: QueryFilters): QueryState<TData, TError> | undefined;
    removeQueries(filters?: QueryFilters): void;
    removeQueries(queryKey?: QueryKey, filters?: QueryFilters): void;
    resetQueries(filters?: QueryFilters, options?: ResetOptions): Promise<void>;
    resetQueries(queryKey?: QueryKey, filters?: QueryFilters, options?: ResetOptions): Promise<void>;
    cancelQueries(filters?: QueryFilters, options?: CancelOptions): Promise<void>;
    cancelQueries(queryKey?: QueryKey, filters?: QueryFilters, options?: CancelOptions): Promise<void>;
    invalidateQueries(filters?: InvalidateQueryFilters, options?: InvalidateOptions): Promise<void>;
    invalidateQueries(queryKey?: QueryKey, filters?: InvalidateQueryFilters, options?: InvalidateOptions): Promise<void>;
    refetchQueries(filters?: QueryFilters, options?: RefetchOptions): Promise<void>;
    refetchQueries(queryKey?: QueryKey, filters?: QueryFilters, options?: RefetchOptions): Promise<void>;
    fetchQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(options: FetchQueryOptions<TQueryFnData, TError, TData>): Promise<TData>;
    fetchQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, options?: FetchQueryOptions<TQueryFnData, TError, TData>): Promise<TData>;
    fetchQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, queryFn: QueryFunction<TQueryFnData>, options?: FetchQueryOptions<TQueryFnData, TError, TData>): Promise<TData>;
    prefetchQuery(options: FetchQueryOptions): Promise<void>;
    prefetchQuery(queryKey: QueryKey, options?: FetchQueryOptions): Promise<void>;
    prefetchQuery(queryKey: QueryKey, queryFn: QueryFunction, options?: FetchQueryOptions): Promise<void>;
    fetchInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(options: FetchInfiniteQueryOptions<TQueryFnData, TError, TData>): Promise<InfiniteData<TData>>;
    fetchInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, options?: FetchInfiniteQueryOptions<TQueryFnData, TError, TData>): Promise<InfiniteData<TData>>;
    fetchInfiniteQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(queryKey: QueryKey, queryFn: QueryFunction<TQueryFnData>, options?: FetchInfiniteQueryOptions<TQueryFnData, TError, TData>): Promise<InfiniteData<TData>>;
    prefetchInfiniteQuery(options: FetchInfiniteQueryOptions): Promise<void>;
    prefetchInfiniteQuery(queryKey: QueryKey, options?: FetchInfiniteQueryOptions): Promise<void>;
    prefetchInfiniteQuery(queryKey: QueryKey, queryFn: QueryFunction, options?: FetchInfiniteQueryOptions): Promise<void>;
    cancelMutations(): Promise<void>;
    resumePausedMutations(): Promise<void>;
    executeMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(options: MutationOptions<TData, TError, TVariables, TContext>): Promise<TData>;
    getQueryCache(): QueryCache;
    getMutationCache(): MutationCache;
    getDefaultOptions(): DefaultOptions;
    setDefaultOptions(options: DefaultOptions): void;
    setQueryDefaults(queryKey: QueryKey, options: QueryObserverOptions<any, any, any, any>): void;
    getQueryDefaults(queryKey?: QueryKey): QueryObserverOptions<any, any, any, any> | undefined;
    setMutationDefaults(mutationKey: MutationKey, options: MutationObserverOptions<any, any, any, any>): void;
    getMutationDefaults(mutationKey?: MutationKey): MutationObserverOptions<any, any, any, any> | undefined;
    defaultQueryOptions<T extends QueryOptions<any, any, any>>(options?: T): T;
    defaultQueryObserverOptions<T extends QueryObserverOptions<any, any, any, any>>(options?: T): T;
    defaultMutationOptions<T extends MutationOptions<any, any, any, any>>(options?: T): T;
    clear(): void;
}
export {};
