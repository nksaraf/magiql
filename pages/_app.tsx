// import App from 'next/app'

import React from "react";
import {
  createClient,
  GraphQLClientProvider,
  createNormalizedQueryCacheStore,
  createQueryCacheStore,
} from "../src";
import { createRecoilStore, RecoilRoot } from "../src/recoil";
import { dataKeys } from "../examples/dataId";
import GraphQLDevtools from "../src/devtools";

const client = createClient({
  endpoint: "https://qwerty-ts.herokuapp.com/v1/graphql",
  queryConfig: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
  useStore: createRecoilStore({
    getDataID: (record, type: keyof typeof dataKeys) => {
      try {
        return `${type}:${dataKeys[type]
          .map((d) => {
            if (!record[d]) throw new Error();
            return record[d];
          })
          .join(":")}`;
      } catch (e) {
        return null;
      }
    },
  }),
});

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <GraphQLClientProvider client={client}>
        <Component {...pageProps} />
        <GraphQLDevtools />
      </GraphQLClientProvider>
    </RecoilRoot>
  );
}

export default MyApp;
