import type { QueryObserverOptions, QueryObserverResult } from './types';
import type { QueryClient } from './queryClient';
import { QueryObserver } from './queryObserver';
import { Subscribable } from './subscribable';
declare type QueriesObserverListener<TData, TError> = (result: QueryObserverResult<TData, TError>[]) => void;
export declare class QueriesObserver<TData, TError> extends Subscribable<QueriesObserverListener<TData, TError>> {
    private client;
    private result;
    private queries;
    private observers;
    private Observer;
    constructor(client: QueryClient, queries?: QueryObserverOptions<TData, TError>[], Observer?: typeof QueryObserver);
    protected onSubscribe(): void;
    protected onUnsubscribe(): void;
    destroy(): void;
    setQueries(queries: QueryObserverOptions<TData, TError>[]): void;
    getCurrentResult(): QueryObserverResult<TData, TError>[];
    private updateObservers;
    private onUpdate;
    private notify;
}
export {};
