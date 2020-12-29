import React from 'react';
import { QueryClient } from '../core';
export declare const useQueryClient: () => QueryClient;
export interface QueryClientProviderProps {
    client: QueryClient;
}
export declare const QueryClientProvider: React.FC<QueryClientProviderProps>;
