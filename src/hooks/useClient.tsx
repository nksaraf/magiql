import React from "react";
import { ReactQueryCacheProvider, ReactQueryConfigProvider } from "react-query";

import { GraphQLClient } from "../types";

const GraphQLClientContext = React.createContext<GraphQLClient | null>(null);

export function useClient() {
  return React.useContext(GraphQLClientContext) as GraphQLClient;
}

export const GraphQLClientProvider = ({
  client,
  children,
}: React.PropsWithChildren<{
  client: GraphQLClient;
}>) => {
  return (
    <ReactQueryCacheProvider queryCache={client.cache}>
      <ReactQueryConfigProvider config={client.queryConfig}>
        <GraphQLClientContext.Provider value={client}>
          {children}
        </GraphQLClientContext.Provider>
      </ReactQueryConfigProvider>
    </ReactQueryCacheProvider>
  );
};
