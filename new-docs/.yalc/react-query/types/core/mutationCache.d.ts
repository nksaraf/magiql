import type { MutationOptions } from './types';
import type { QueryClient } from './queryClient';
import { Mutation, MutationState } from './mutation';
import { Subscribable } from './subscribable';
interface MutationCacheConfig {
    onError?: (error: unknown, variables: unknown, context: unknown, mutation: Mutation<unknown, unknown, unknown, unknown>) => void;
}
declare type MutationCacheListener = (mutation?: Mutation) => void;
export declare class MutationCache extends Subscribable<MutationCacheListener> {
    config: MutationCacheConfig;
    private mutations;
    private mutationId;
    constructor(config?: MutationCacheConfig);
    build<TData, TError, TVariables, TContext>(client: QueryClient, options: MutationOptions<TData, TError, TVariables, TContext>, state?: MutationState<TData, TError, TVariables, TContext>): Mutation<TData, TError, TVariables, TContext>;
    add(mutation: Mutation<any, any, any, any>): void;
    remove(mutation: Mutation<any, any, any, any>): void;
    clear(): void;
    getAll(): Mutation[];
    notify(mutation?: Mutation<any, any, any, any>): void;
    onFocus(): void;
    onOnline(): void;
    resumePausedMutations(): Promise<void>;
}
export {};
