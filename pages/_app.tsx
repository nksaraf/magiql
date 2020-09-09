// import App from 'next/app'

import React from "react";
import {
  GraphQLClient,
  GraphQLClientProvider,
  createNormalizedQueryCacheStore,
  createQueryCacheStore,
} from "../src";
// import { createRecoilStore, RecoilRoot } from "../../src/recoil";
import GraphQLDevtools from "../src/devtools";
import { createRecoilStore } from "../src/recoil";

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
  queryConfig: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
  useStore: createRecoilStore(),
});

export default function App({ Component, pageProps }) {
  return (
    <GraphQLClientProvider client={client}>
      <Component {...pageProps} />
      <GraphQLDevtools />
    </GraphQLClientProvider>
  );
}
