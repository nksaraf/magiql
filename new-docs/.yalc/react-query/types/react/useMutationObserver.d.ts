import { MutationObserver } from '../core/mutationObserver';
import { UseMutateFunction } from './types';
import { MutationObserverOptions } from '../core/types';
export declare function useMutationObserver<TData, TError, TVariables, TContext>(options: MutationObserverOptions<TData, TError, TVariables, TContext>, Observer: typeof MutationObserver): {
    mutate: UseMutateFunction<TData, TError, TVariables, TContext>;
    mutateAsync: import("../core/types").MutateFunction<TData, TError, TVariables, TContext>;
    isError: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    reset: () => void;
    context: TContext | undefined;
    data: TData | undefined;
    error: TError | null;
    failureCount: number;
    isPaused: boolean;
    status: import("../core/types").MutationStatus;
    variables: TVariables | undefined;
};
