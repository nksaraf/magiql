import React from 'react';
export declare const isServer: boolean;
export declare function isStale(query: any): any;
export declare function getQueryStatusColor(query: any, theme: any): any;
export declare function getQueryStatusLabel(query: any): "fetching" | "inactive" | "stale" | "fresh";
export declare function styled(type: any, newStyles: any, queries?: {}): React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
/**
 * This hook is a safe useState version which schedules state updates in microtasks
 * to prevent updating a component state while React is rendering different components
 * or when the component is not mounted anymore.
 */
export declare function useSafeState(initialState: any): any[];
