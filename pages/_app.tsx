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
import { createNormalizer } from "magiql";

// function useExchanges(client: GraphQLClient) {
//   const store = client.useStore();

//   return [
//     errorExchange({
//       onError: (error) => {
//         throw error;
//       },
//     }),
//     storeExchange(store),
//     fetchExchange,
//   ];
// }

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
  onDebugEvent: (event) => {
    console.log(
      `[${event.source}]: ${event.operation.request.node.operation.name} ${event.message}`,
      event.data
    );
  },
  useStore: createNormalizedQueryCacheStore(),
  normalizer: createNormalizer(),
});

export default function App({ Component, pageProps }) {
  return (
    <GraphQLClientProvider client={client}>
      <Component {...pageProps} />
      <GraphQLDevtools
        defaultIsOpen={true}
        defaultTab="store"
        style={{ top: 64 }}
      />
    </GraphQLClientProvider>
  );
}
