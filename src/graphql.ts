import { UseQueryResult, UseQueryOptions } from "./client/useQuery";
import React from "react";

export type Types = { [key: string]: any };

export type Maybe<T> = T | null;

export type Type<K extends keyof Types = "Query"> = Types[K];

export type MagiQLFragment = (name?: string) => string;

export function useMagiqlQuery<TQuery = any, TVariables = {}, TError = Error>(
  name: string,
  options?: UseQueryOptions<TQuery, TVariables, TError>
): Omit<UseQueryResult<TQuery, TError>, "data"> & {
  query: TQuery;
  variables: TVariables;
} {
  throw new Error(
    `Unimplemented: Make sure magiql/babel is added as a plugin.`
  );
}

export function useFragment<K extends keyof Types>(name: K): Type<K> {
  throw new Error(
    `Unimplemented: Make sure magiql/babel is added as a plugin.`
  );
}

export type FragmentProps<F = {}> = {
  [K in keyof F]?: Maybe<F[K]>;
};

export type ComponentTypeWithFragment<F = {}, P = {}> = React.ComponentType<
  FragmentProps<F> & P
>;

export type ComponentWithFragment<F = {}, P = {}> = ComponentTypeWithFragment<
  F,
  P
> &
  { [K in keyof F]?: MagiQLFragment };

export function withFragment<F = {}, P = any>(
  Component: ComponentTypeWithFragment<F, P>
): ComponentWithFragment<F, P> {
  return Component as any;
}
