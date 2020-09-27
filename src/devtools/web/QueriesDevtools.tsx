import React from "react";
import { ReactQueryCacheProvider } from "react-query";
import { ReactQueryDevtoolsPanel } from "react-query-devtools";
import { useGraphQLClient } from "../../hooks";

export function QueriesDevtools() {
  const client = useGraphQLClient();
  return (
    <ReactQueryCacheProvider queryCache={client.cache}>
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
