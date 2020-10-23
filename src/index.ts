import { unstable_batchedUpdates } from "react-dom";
import { setConsole } from "react-query";

import { setBatch } from "./utils/batchedUpdates";

export * from "./core/graphQLClient";
export * from "./exchanges/compose";
export * from "./fetch/fetchGraphQL";
export * from "./types";
export * from "./store/cacheStore";
export * from "./store/normalizedCacheStore";
export * from "./operation/normalizer";
export * from "./operation/reader";
export * from "./utils";
export * from "./operation/parser";
export * from "./operation/operation";
export * from "./operation/graphql-tag";
export * from "./hooks/useGraphQLClient";
export * from "./hooks/useQuery";
export * from "./hooks/useInfiniteQuery";
export * from "./hooks/useMutation";
export * from "./hooks/useFragment";
export * from "./utils/batchedUpdates";

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});

setBatch(unstable_batchedUpdates);
