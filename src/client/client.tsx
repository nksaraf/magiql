import { Options, Middleware, fetchGraphQL } from "./fetch";
import {
  queryCache,
  ReactQueryConfigProvider,
  ReactQueryProviderConfig,
} from "react-query";
import { SubscriptionClient } from "subscriptions-transport-ws";
import React from "react";

export interface ClientFetchFn<TData, TVariables> {
  (
    query: string,
    variables?: TVariables,
    fetchMiddleware?: Middleware<TData, TVariables>[]
  ): Promise<TData>;
}

export interface GraphQLClientOptions<TData, TVariables> {
  subscriptionUrl?: string;
  fetchOptions?: Options;
  config?: ReactQueryProviderConfig;
  middleware?: Middleware<TData, TVariables>[];
}
export interface GraphQLClient<TData, TVariables>
  extends GraphQLClientOptions<TData, TVariables> {
  url: string;
  cache: typeof queryCache;
  subscriptionClient?: SubscriptionClient;
  fetch: ClientFetchFn<TData, TVariables>;
}

export const createClient = (
  url: string,
  {
    subscriptionUrl,
    fetchOptions = {},
    middleware = [],
    config = {},
  }: GraphQLClientOptions<any, any> = {}
) => {
  return {
    url,
    fetchOptions: fetchOptions,
    middleware,
    config,
    subscriptionUrl,
    subscriptionClient:
      subscriptionUrl &&
      typeof window !== "undefined" &&
      new SubscriptionClient(subscriptionUrl, {
        reconnect: true,
      }),
    cache: queryCache,
    fetch: async <TData, TVariables>(
      query: string,
      variables?: TVariables,
      fetchMiddleware: Middleware<TData, TVariables>[] = []
    ): Promise<TData> => {
      return await fetchGraphQL(url, query, variables, {
        ...fetchOptions,
        middleware: [...fetchMiddleware, ...middleware],
      });
    },
  } as GraphQLClient<any, any>;
};

const MagiqlContext = React.createContext<GraphQLClient<any, any>>(
  createClient("/graphql")
);

export function useClient<TData, TVariables>(): GraphQLClient<
  TData,
  TVariables
> {
  return React.useContext(MagiqlContext);
}

export const MagiqlProvider = ({
  children,
  client,
}: React.PropsWithChildren<{ client: GraphQLClient<any, any> }>) => {
  return (
    <ReactQueryConfigProvider config={client.config}>
      <MagiqlContext.Provider value={client}>{children}</MagiqlContext.Provider>
    </ReactQueryConfigProvider>
  );
};
