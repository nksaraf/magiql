import "react-notion/src/styles.css";
import "prismjs/themes/prism.css";

import React from "react";
import {
  GraphQLClient,
  GraphQLClientProvider,
  createNormalizedQueryCacheStore,
  createQueryCacheStore,
} from "magiql";
// import { createRecoilStore, RecoilRoot } from "../../src/recoil";
import GraphQLDevtools from "magiql/devtools";
// import { createRecoilStore } from "magiql/recoil";
import { createJotaiStore } from "magiql/jotai";

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
  queryConfig: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
  useStore: createJotaiStore(),
});

export default function App({ Component, pageProps }) {
  return (
    <GraphQLClientProvider client={client}>
      <Component {...pageProps} />
      <GraphQLDevtools />
    </GraphQLClientProvider>
  );
}
