import { Query, TypeMaps } from './generated/graphql';

export const useMagiqlQuery = (name: string) => {
  return {
    query: {} as Query
  }
}

export const useFragment = <K extends keyof TypeMaps>(name: K) => {
  return {} as TypeMaps[K];
}