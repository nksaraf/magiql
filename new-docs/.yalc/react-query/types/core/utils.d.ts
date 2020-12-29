import type { Query } from './query';
import type { MutationFunction, MutationKey, MutationOptions, QueryFunction, QueryKey, QueryKeyHashFunction, QueryOptions, QueryStatus } from './types';
export interface QueryFilters {
    /**
     * Include or exclude active queries
     */
    active?: boolean;
    /**
     * Match query key exactly
     */
    exact?: boolean;
    /**
     * Include or exclude inactive queries
     */
    inactive?: boolean;
    /**
     * Include queries matching this predicate function
     */
    predicate?: (query: Query) => boolean;
    /**
     * Include queries matching this query key
     */
    queryKey?: QueryKey;
    /**
     * Include or exclude stale queries
     */
    stale?: boolean;
    /**
     * Include or exclude fetching queries
     */
    fetching?: boolean;
}
export declare type DataUpdateFunction<TInput, TOutput> = (input: TInput) => TOutput;
export declare type Updater<TInput, TOutput> = TOutput | DataUpdateFunction<TInput, TOutput>;
export declare const isServer: boolean;
export declare function noop(): undefined;
export declare function functionalUpdate<TInput, TOutput>(updater: Updater<TInput, TOutput>, input: TInput): TOutput;
export declare function isValidTimeout(value: any): value is number;
export declare function ensureArray<T>(value: T | T[]): T[];
export declare function difference<T>(array1: T[], array2: T[]): T[];
export declare function replaceAt<T>(array: T[], index: number, value: T): T[];
export declare function timeUntilStale(updatedAt: number, staleTime?: number): number;
export declare function parseQueryArgs<TOptions extends QueryOptions<any, any, any>>(arg1: QueryKey | TOptions, arg2?: QueryFunction<any> | TOptions, arg3?: TOptions): TOptions;
export declare function parseMutationArgs<TOptions extends MutationOptions<any, any, any, any>>(arg1: MutationKey | MutationFunction<any, any> | TOptions, arg2?: MutationFunction<any, any> | TOptions, arg3?: TOptions): TOptions;
export declare function parseFilterArgs<TFilters extends QueryFilters, TOptions = unknown>(arg1?: QueryKey | TFilters, arg2?: TFilters | TOptions, arg3?: TOptions): [TFilters, TOptions | undefined];
export declare function matchQuery(filters: QueryFilters, query: Query<any, any>): boolean;
export declare function getQueryKeyHashFn(options?: QueryOptions<any, any>): QueryKeyHashFunction;
/**
 * Default query keys hash function.
 */
export declare function hashQueryKey(queryKey: QueryKey): string;
/**
 * Hashes the value into a stable hash.
 */
export declare function stableValueHash(value: any): string;
/**
 * Checks if key `b` partially matches with key `a`.
 */
export declare function partialMatchKey(a: string | unknown[], b: string | unknown[]): boolean;
/**
 * Checks if `b` partially matches with `a`.
 */
export declare function partialDeepEqual(a: any, b: any): boolean;
/**
 * This function returns `a` if `b` is deeply equal.
 * If not, it will replace any deeply equal children of `b` with those of `a`.
 * This can be used for structural sharing between JSON values for example.
 */
export declare function replaceEqualDeep<T>(a: unknown, b: T): T;
/**
 * Shallow compare objects. Only works with objects that always have the same properties.
 */
export declare function shallowEqualObjects<T>(a: T, b: T): boolean;
export declare function isPlainObject(o: any): o is Object;
export declare function isQueryKey(value: any): value is QueryKey;
export declare function isError(value: any): value is Error;
export declare function sleep(timeout: number): Promise<void>;
export declare function getStatusProps<T extends QueryStatus>(status: T): {
    status: T;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    isIdle: boolean;
};
/**
 * Schedules a microtask.
 * This can be useful to schedule state updates after rendering.
 */
export declare function scheduleMicrotask(callback: () => void): void;
