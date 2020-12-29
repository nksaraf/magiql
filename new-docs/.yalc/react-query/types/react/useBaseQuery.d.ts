import { QueryObserver } from '../core/queryObserver';
import { QueryObserverResult } from '../core/types';
import { UseBaseQueryOptions } from './types';
export declare function useBaseQuery<TQueryFnData, TError, TData, TQueryData>(options: UseBaseQueryOptions<TQueryFnData, TError, TData, TQueryData>, Observer: typeof QueryObserver): QueryObserverResult<any, any>;
