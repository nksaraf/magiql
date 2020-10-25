import "react-notion/src/styles.css";
import "prismjs/themes/prism.css";

import React from "react";
import Head from "next/head";
import { Client, GraphQLClientProvider } from "magiql";
import GraphQLDevtools from "magiql/devtools";

const client = new Client({
  endpoint: "https://todo-magiql.hasura.app/v1/graphql",
  onDebugEvent: (event) => {
    console.log(
      `${event.operation.request.node.operation.name} => ${event.source} ${event.message}`,
      event.data
    );
  },
  queryConfig: {
    queries: {
      refetchOnMount: false,
      refetchInterval: false,
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
