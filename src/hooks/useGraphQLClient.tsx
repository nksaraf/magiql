import { EnvironmentContext } from "magiql/core/EnvironmentContext";
import React from "react";
import { ReactQueryCacheProvider, ReactQueryConfigProvider } from "react-query";

import { GraphQLClient } from "../core/graphQLClient";

export const GraphQLClientContext = React.createContext<GraphQLClient | null>(
  null
);

export function useGraphQLClient() {
  const client = React.useContext(GraphQLClientContext);
  if (!client) {
    throw new Error("No GraphQL Client found!");
  }

  return client;
}

export const GraphQLClientProvider = ({
  client,
  children,
}: React.PropsWithChildren<{
  client: GraphQLClient;
}>) => {
  const useStore = client.useStore;
  const clientProvider = (
    <ReactQueryCacheProvider queryCache={client.cache}>
      <ReactQueryConfigProvider config={client.queryConfig}>
        <GraphQLClientContext.Provider value={client}>
          <EnvironmentContext.Provider value={client.environment}>
            {children}
          </EnvironmentContext.Provider>
        </GraphQLClientContext.Provider>
      </ReactQueryConfigProvider>
    </ReactQueryCacheProvider>
  );
  return useStore.Provider ? (
    <useStore.Provider>{clientProvider}</useStore.Provider>
  ) : (
    clientProvider
  );
};
