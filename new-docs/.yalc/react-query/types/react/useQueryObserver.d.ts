import { QueryObserver } from '../core/queryObserver';
import { QueryObserverOptions, QueryObserverResult } from '../core/types';
export declare function useQueryObserver<TQueryFnData = unknown, TError = Error, TData = TQueryFnData, TQueryData = TQueryFnData>(options: QueryObserverOptions<TQueryFnData, TError, TData, TQueryData>, Observer: typeof QueryObserver): QueryObserverResult<TData, TError>;
