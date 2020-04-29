import { UseQueryResult, UseQueryOptions } from './client/hooks';

export function useMagiqlQuery(name: string, options?: UseQueryOptions<any,any>): Omit<UseQueryResult<any>, "data"> & { query: any } {
  return {} as any;
};



export function useFragment<K extends keyof any>(name: K): any {return {}  as any;};