import "react-notion/src/styles.css";
import "prismjs/themes/prism.css";

import Head from "next/head";
import {
  GraphQLClient,
  GraphQLClientProvider,
  createNormalizedQueryCacheStore,
  resolveFetchOptions,
  OperationKind,
  fetchGraphQL,
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

import deepMerge from "deepmerge";
import { Environment, Network, RecordSource, Store } from "relay-runtime";
import { EnvironmentContext } from "../src/core/EnvironmentContext";
// import fetchGraphQL from './fetchGraphQL';
import * as RelayResponseNormalizer from "relay-runtime/lib/store/RelayResponseNormalizer";
// // Relay passes a "params" object with the query name and text. So we define a helper function
// // to call our fetchGraphQL utility with params.text.
// async function fetchRelay(params, variables) {
//   console.log(`fetching query ${params.name} with ${JSON.stringify(variables)}`);
//   return fetchGraphQL(params.text, variables);
// }

// Export a singleton instance of Relay Environment configured with our network function:

export const environment = new Environment({
  network: Network.create(async (params, variables) => {
    const fetchOperation = {
      query: params.text,
      operationName: params.name,
      operationKind: params.operationKind as OperationKind,
      variables: variables,
      endpoint: "https://swapi-graphql.netlify.app/.netlify/functions/index",
    };

    const clientFetchOptions = await resolveFetchOptions(
      client.fetchOptions ?? {},
      fetchOperation
    );

    const operationFetchOptions = await resolveFetchOptions(
      params.metadata.fetchOptions ?? {},
      fetchOperation
    );

    const fetchOptions = deepMerge(clientFetchOptions, operationFetchOptions);
    return (await fetchGraphQL({
      fetchOptions,
      ...fetchOperation,
    })) as any;
  }),
  store: new Store(new RecordSource()),
});

export default function App({ Component, pageProps }) {
  return (
    <EnvironmentContext.Provider value={environment}>
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
    </EnvironmentContext.Provider>
  );
}
