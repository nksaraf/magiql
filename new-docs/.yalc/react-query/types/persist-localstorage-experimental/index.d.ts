import { QueryClient } from '../core';
interface Options {
    /** The key to use when storing the cache to localstorage */
    localStorageKey?: string;
    /** To avoid localstorage spamming,
     * pass a time in ms to throttle saving the cache to disk */
    throttleTime?: number;
    /** The max-allowed age of the cache.
     * If a persisted cache is found that is older than this
     * time, it will be discarded */
    maxAge?: number;
    /** A unique string that can be used to forcefully
     * invalidate existing caches if they do not share the same buster string */
    buster?: string;
}
export declare function persistWithLocalStorage(queryClient: QueryClient, { localStorageKey, throttleTime, maxAge, buster, }?: Options): void;
export {};
