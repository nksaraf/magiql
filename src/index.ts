import { unstable_batchedUpdates } from "react-dom";
import { setConsole } from "react-query";

import { setBatch } from "./core/store/batchedUpdates";

export * from "./core/graphQLClient";
export * from "./core/exchanges";
export * from "./core/fetchGraphQL";
export * from "./core/types";
export * from "./core/store/cacheStore";
export * from "./core/store/normalizedCacheStore";
export * from "./core/normalizer/relayNormalizer";
// export * from "./core/normalizer/relayNormalizer";
export * from "./hooks";
export * from "./core/store/batchedUpdates";
export * from "./core/operation";

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});

setBatch(unstable_batchedUpdates);
