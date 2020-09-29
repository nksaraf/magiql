import "react-notion/src/styles.css";
import "prismjs/themes/prism.css";

import React from "react";
import Head from "next/head";
import {
  GraphQLClient,
  GraphQLClientProvider,
  createNormalizedQueryCacheStore,
} from "magiql";
import GraphQLDevtools from "magiql/devtools";
import { createRecoilStore } from "magiql/recoil-store";

const client = new GraphQLClient({
  endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
  onDebugEvent: (event) => {
    console.log(
      `${event.operation.request.node.operation.name} => ${event.source} ${event.message}`,
      event.data
    );
  },
  useStore: createRecoilStore(),
});

export default function App({ Component, pageProps }) {
  return (
    <GraphQLClientProvider client={client}>
      <Head>
        <title>magiql: GraphQL hooks for React</title>
      </Head>
      <Component {...pageProps} />
      <GraphQLDevtools
        defaultIsOpen={true}
        defaultTab="store"
        style={{ top: 64 }}
      />
    </GraphQLClientProvider>
  );
}
