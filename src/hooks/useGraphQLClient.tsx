import { ReactQueryCacheProvider, ReactQueryConfigProvider } from "react-query";
import { Client } from "../client/client";
import React from "react";

export const GraphQLClientContext = React.createContext<Client | null>(
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
  client: Client;
}>) => {
  return (
    <ReactQueryCacheProvider queryCache={client.queryCache}>
      <ReactQueryConfigProvider config={client.queryConfig}>
        <GraphQLClientContext.Provider value={client}>
          {children}
        </GraphQLClientContext.Provider>
      </ReactQueryConfigProvider>
    </ReactQueryCacheProvider>
  );
};
