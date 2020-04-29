import { Options, Middleware, fetchGraphQL } from "./fetch";
import { queryCache } from "react-query";
import React from "react";

export interface FetchGraphQL<TData extends any, TVariables extends object> {
  (
    query: string,
    variables?: TVariables,
    fetchMiddleware?: Middleware[]
  ): Promise<TData>;
}

export interface GraphQLClient {
  url: string;
  options?: Options;
  middleware?: Middleware[];
  cache: typeof queryCache;
  fetch: FetchGraphQL<any, any>;
}

export const createClient = (
  url: string,
  options: Options = {},
  middleware: Middleware[] = []
) => {
  return {
    url,
    options,
    middleware,
    cache: queryCache,
    fetch: async <TData, TVariables extends object>(
      query: string,
      variables?: TVariables,
      fetchMiddleware: Middleware[] = []
    ): Promise<TData> => {
      return await fetchGraphQL(url, query, variables, {
        ...options,
        middleware: [...fetchMiddleware, ...middleware],
      });
    },
  } as GraphQLClient;
};

const MagiqlContext = React.createContext<GraphQLClient>(
  createClient("/graphql")
);

export function useMagiqlClient<TData, TVariables extends object>() {
  return React.useContext(MagiqlContext);
}

export const MagiqlProvider = ({
  children,
  client,
}: React.PropsWithChildren<{ client: GraphQLClient }>) => {
  return (
    <MagiqlContext.Provider value={client}>{children}</MagiqlContext.Provider>
  );
};
