import React from "react";

import { GraphQLClientContext } from "./useClient";

export function useStore() {
  const client = React.useContext(GraphQLClientContext);
  if (!client) {
    throw new Error("No GraphQL Client found!");
  }

  return client.useStore();
}
