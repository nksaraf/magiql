import { Options, Middleware, fetchGraphQL } from "./fetch";
import {
  queryCache,
  ReactQueryConfigProvider,
  ReactQueryProviderConfig,
} from "react-query";
import React from "react";

export interface FetchGraphQL<TData extends any, TVariables extends object> {
  (
    query: string,
    variables?: TVariables,
    fetchMiddleware?: Middleware[]
  ): Promise<TData>;
}

export interface GraphQLClientOptions {
  fetchOptions?: Options;
  config?: ReactQueryProviderConfig;
  middleware?: Middleware[];
}
export interface GraphQLClient extends GraphQLClientOptions {
  url: string;
  cache: typeof queryCache;
  fetch: FetchGraphQL<any, any>;
}

export const createClient = (
  url: string,
  { fetchOptions = {}, middleware = [], config = {} }: GraphQLClientOptions = {}
) => {
  return {
    url,
    fetchOptions: fetchOptions,
    middleware,
    config,
    cache: queryCache,
    fetch: async <TData, TVariables extends object>(
      query: string,
      variables?: TVariables,
      fetchMiddleware: Middleware[] = []
    ): Promise<TData> => {
      return await fetchGraphQL(url, query, variables, {
        ...fetchOptions,
        middleware: [...fetchMiddleware, ...middleware],
      });
    },
  } as GraphQLClient;
};

const MagiqlContext = React.createContext<GraphQLClient>(
  createClient("/graphql")
);

export function useClient<TData, TVariables extends object>() {
  return React.useContext(MagiqlContext);
}

export const MagiqlProvider = ({
  children,
  client,
}: React.PropsWithChildren<{ client: GraphQLClient }>) => {
  return (
    <ReactQueryConfigProvider config={client.config}>
      <MagiqlContext.Provider value={client}>{children}</MagiqlContext.Provider>
    </ReactQueryConfigProvider>
  );
};
