import "react-notion/src/styles.css";
import "prismjs/themes/prism.css";

import React from "react";
import Head from "next/head";
import { GraphQLClient, GraphQLClientProvider } from "magiql";
import GraphQLDevtools from "magiql/devtools";

const client = new GraphQLClient({
  endpoint: "https://todo-magiql.hasura.app/v1/graphql",
  queryConfig: {
    queries: {
      refetchOnMount: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    },
  },
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
