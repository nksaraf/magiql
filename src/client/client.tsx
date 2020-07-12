import { Options, fetchGraphQL, FetchOptionsFn, OperationType } from "./fetch";
import {
  queryCache,
  ReactQueryConfigProvider,
  ReactQueryProviderConfig,
  QueryCache,
  QueryOptions,
  CachedQuery,
} from "react-query";
import { SubscriptionClient } from "subscriptions-transport-ws";
import React from "react";
import { GraphqlQueryKey } from "./utils";

export type ClientFetchOperation<TVariables> = {
  query: string;
  variables?: TVariables;
  operationName?: string;
  operationType?: OperationType;
};

export interface ClientFetchFn<TData, TVariables> {
  (operation: ClientFetchOperation<TVariables>): Promise<TData>;
}

export interface GraphQLClient<TData, TVariables> {
  endpoint?: string;
  fetchOptions?: FetchOptionsFn<TVariables>;
  reactQueryConfig?: ReactQueryProviderConfig;
  cache?: MagiqlCache;
  subscriptions?: {
    client?: SubscriptionClient;
    endpoint?: string;
    fetchOptions?: FetchOptionsFn<TVariables>;
  };
  fetch?: ClientFetchFn<TData, TVariables>;
}

interface BuiltQuery<TData, TError> extends CachedQuery<TData, TError> {
  subscribe(
    callback: () => void
  ): {
    unsubscribe: () => void;
  };
  setState(updater: (oldState: any) => any): void;
}

interface MagiqlCache extends QueryCache {
  buildQuery: <TData, TVariables, TError = Error>(
    queryKey: GraphqlQueryKey<TVariables>,
    config: QueryOptions<TData, TError>
  ) => BuiltQuery<TData, TError>;
}

export const createClient = ({
  endpoint = "/graphql",
  fetchOptions = () => {
    return {};
  },
  cache = queryCache as MagiqlCache,
  subscriptions = undefined,
  reactQueryConfig = {},
  fetch = async <TData, TVariables>({
    query,
    variables = {} as TVariables,
    operationName = undefined,
    operationType = OperationType.Query,
  }): Promise<TData> => {
    return await fetchGraphQL({
      endpoint,
      query,
      variables,
      fetchOptions,
      operationName,
      operationType,
    });
  },
}: GraphQLClient<any, any> = {}) => {
  if (subscriptions && typeof window !== "undefined") {
    let {
      endpoint: subscriptionEndpoint = endpoint,
      fetchOptions: subscriptionFetchOptions = fetchOptions,
      client = new SubscriptionClient(subscriptionEndpoint, {
        reconnect: true,
        connectionParams: () => {
          return subscriptionFetchOptions({
            operationType: OperationType.Subscription,
            endpoint: subscriptionEndpoint,
          });
        },
      }),
    } = subscriptions;

    subscriptions = {
      client,
      endpoint: subscriptionEndpoint,
      fetchOptions: subscriptionFetchOptions,
    };
  }

  return {
    endpoint,
    fetchOptions,
    cache,
    reactQueryConfig,
    subscriptions,
    fetch,
  } as GraphQLClient<any, any>;
};

const MagiqlContext = React.createContext<GraphQLClient<any, any>>(
  createClient()
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
    <ReactQueryConfigProvider config={client.reactQueryConfig}>
      <MagiqlContext.Provider value={client}>{children}</MagiqlContext.Provider>
    </ReactQueryConfigProvider>
  );
};
