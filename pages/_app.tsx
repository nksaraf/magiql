// import App from 'next/app'
import "react-notion/src/styles.css";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import Head from "next/head";
// import "prismjs/components/prism-javascript";

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
