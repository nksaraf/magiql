import "react-notion/src/styles.css";
import "prismjs/themes/prism.css";

import React from "react";
import {
  GraphQLClient,
  GraphQLClientProvider,
  createNormalizedQueryCacheStore,
  createQueryCacheStore,
  debugExchange,
  errorExchange,
  storeExchange,
  fetchExchange,
} from "magiql";
import GraphQLDevtools from "magiql/devtools";
import { createRecoilStore } from "magiql/recoil-store";

function useExchanges(client: GraphQLClient) {
  const store = client.useStore();

  return [
    debugExchange,
    errorExchange({
      onError: (error) => {
        throw error;
      },
    }),
    storeExchange(store),
    fetchExchange,
  ];
}

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
  useExchanges: useExchanges,
  onDebugEvent: (event) => {
    console.log(
      `[${event.source}]: ${event.operation.request.node.operation.name} ${event.message}`
    );
  },
  useStore: createRecoilStore(),
});

export default function App({ Component, pageProps }) {
  return (
    <GraphQLClientProvider client={client}>
      <Component {...pageProps} />
      <GraphQLDevtools defaultIsOpen={true} defaultTab="store" />
    </GraphQLClientProvider>
  );
}
