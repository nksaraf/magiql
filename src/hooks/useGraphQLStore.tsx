import React from "react";

import { GraphQLClientContext } from "./useGraphQLClient";

export function useGraphQLStore() {
  const client = React.useContext(GraphQLClientContext);
  if (!client) {
    throw new Error("No GraphQL Client found!");
  }

  return client.useStore();
}
