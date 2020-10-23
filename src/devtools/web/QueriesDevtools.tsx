import React from "react";
import { ReactQueryCacheProvider } from "react-query";
import { ReactQueryDevtoolsPanel } from "react-query-devtools";
import { useGraphQLClient } from "../../hooks/useGraphQLClient";

export function QueriesDevtools() {
  const client = useGraphQLClient();
  return (
    <ReactQueryCacheProvider queryCache={client.queryCache}>
      <div
        style={{
          overflow: "scroll",
          width: "100%",
          flex: 1,
          borderRadius: 8,
        }}
      >
        <ReactQueryDevtoolsPanel />
      </div>
    </ReactQueryCacheProvider>
  );
}
