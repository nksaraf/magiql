import { Updater } from './utils';
import type { QueryKey, QueryOptions, QueryStatus } from './types';
import type { QueryCache } from './queryCache';
import type { QueryObserver } from './queryObserver';
import { CancelOptions } from './retryer';
interface QueryConfig<TQueryFnData, TError, TData> {
    cache: QueryCache;
    queryKey: QueryKey;
    queryHash: string;
    options?: QueryOptions<TQueryFnData, TError, TData>;
    defaultOptions?: QueryOptions<TQueryFnData, TError, TData>;
    state?: QueryState<TData, TError>;
}
export interface QueryState<TData = unknown, TError = unknown> {
    data: TData | undefined;
    dataUpdateCount: number;
    dataUpdatedAt: number;
    error: TError | null;
    errorUpdateCount: number;
    errorUpdatedAt: number;
    fetchFailureCount: number;
    fetchMeta: any;
    isFetching: boolean;
    isInvalidated: boolean;
    isPaused: boolean;
    status: QueryStatus;
}
export interface FetchContext<TQueryFnData, TError, TData> {
    fetchFn: () => unknown | Promise<unknown>;
    fetchOptions?: FetchOptions;
    options: QueryOptions<TQueryFnData, TError, TData>;
    queryKey: QueryKey;
    state: QueryState<TData, TError>;
}
export interface QueryBehavior<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData> {
    onFetch: (context: FetchContext<TQueryFnData, TError, TData>) => void;
}
export interface FetchOptions {
    cancelRefetch?: boolean;
    meta?: any;
}
export interface SetDataOptions {
    updatedAt?: number;
}
interface FailedAction {
    type: 'failed';
}
interface FetchAction {
    type: 'fetch';
    meta?: any;
}
interface SuccessAction<TData> {
    data: TData | undefined;
    type: 'success';
    dataUpdatedAt?: number;
}
interface ErrorAction<TError> {
    type: 'error';
    error: TError;
}
interface InvalidateAction {
    type: 'invalidate';
}
interface PauseAction {
    type: 'pause';
}
interface ContinueAction {
    type: 'continue';
}
interface SetStateAction<TData, TError> {
    type: 'setState';
    state: QueryState<TData, TError>;
}
export declare type Action<TData, TError> = ContinueAction | ErrorAction<TError> | FailedAction | FetchAction | InvalidateAction | PauseAction | SetStateAction<TData, TError> | SuccessAction<TData>;
export declare class Query<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData> {
    queryKey: QueryKey;
    queryHash: string;
    options: QueryOptions<TQueryFnData, TError, TData>;
    initialState: QueryState<TData, TError>;
    state: QueryState<TData, TError>;
    cacheTime: number;
    private cache;
    private promise?;
    private gcTimeout?;
    private retryer?;
    private observers;
    private defaultOptions?;
    constructor(config: QueryConfig<TQueryFnData, TError, TData>);
    private setOptions;
    setDefaultOptions(options: QueryOptions<TQueryFnData, TError, TData>): void;
    private scheduleGc;
    private clearGcTimeout;
    private optionalRemove;
    setData(updater: Updater<TData | undefined, TData>, options?: SetDataOptions): TData;
    setState(state: QueryState<TData, TError>): void;
    cancel(options?: CancelOptions): Promise<void>;
    destroy(): void;
    reset(): void;
    isActive(): boolean;
    isFetching(): boolean;
    isStale(): boolean;
    isStaleByTime(staleTime?: number): boolean;
    onFocus(): void;
    onOnline(): void;
    addObserver(observer: QueryObserver<any, any, any, any>): void;
    removeObserver(observer: QueryObserver<any, any, any, any>): void;
    invalidate(): void;
    fetch(options?: QueryOptions<TQueryFnData, TError, TData>, fetchOptions?: FetchOptions): Promise<TData>;
    private dispatch;
    protected getDefaultState(options: QueryOptions<TQueryFnData, TError, TData>): QueryState<TData, TError>;
    protected reducer(state: QueryState<TData, TError>, action: Action<TData, TError>): QueryState<TData, TError>;
}
export {};
