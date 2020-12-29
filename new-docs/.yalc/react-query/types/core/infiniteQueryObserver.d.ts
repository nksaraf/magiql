import type { FetchNextPageOptions, FetchPreviousPageOptions, InfiniteData, InfiniteQueryObserverOptions, InfiniteQueryObserverResult } from './types';
import type { QueryClient } from './queryClient';
import { ObserverFetchOptions, QueryObserver } from './queryObserver';
declare type InfiniteQueryObserverListener<TData, TError> = (result: InfiniteQueryObserverResult<TData, TError>) => void;
export declare class InfiniteQueryObserver<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryData = TQueryFnData> extends QueryObserver<TQueryFnData, TError, InfiniteData<TData>, InfiniteData<TQueryData>> {
    subscribe: (listener?: InfiniteQueryObserverListener<TData, TError>) => () => void;
    getCurrentResult: () => InfiniteQueryObserverResult<TData, TError>;
    protected fetch: (fetchOptions?: ObserverFetchOptions) => Promise<InfiniteQueryObserverResult<TData, TError>>;
    constructor(client: QueryClient, options: InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryData>);
    protected bindMethods(): void;
    setOptions(options?: InfiniteQueryObserverOptions<TQueryFnData, TError, TData, TQueryData>): void;
    fetchNextPage(options?: FetchNextPageOptions): Promise<InfiniteQueryObserverResult<TData, TError>>;
    fetchPreviousPage(options?: FetchPreviousPageOptions): Promise<InfiniteQueryObserverResult<TData, TError>>;
    protected getNewResult(willFetch?: boolean): InfiniteQueryObserverResult<TData, TError>;
}
export {};
