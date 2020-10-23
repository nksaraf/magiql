import { unstable_batchedUpdates } from "react-dom";
import { setConsole } from "react-query";

import { setBatch } from "./core/store/batchedUpdates";

export * from "./core/graphQLClient";
export * from "./core/exchanges";
export * from "./core/fetchGraphQL";
export * from "./core/types";
export * from "./core/store/cacheStore";
export * from "./core/store/normalizedCacheStore";
export * from "./core/store/normalizer";
export * from "./core/store/reader";
export * from "./utils";
export * from "./core/operation/parser";
export * from "./core/operation/operation";
export * from "./core/graphQLTag";
export * from "./hooks/useGraphQLClient";
export * from "./hooks/useGraphQLStore";
export * from "./hooks/useQuery";
export * from "./hooks/useInfiniteQuery";
export * from "./hooks/usePaginatedQuery";
export * from "./hooks/useMutation";
export * from "./hooks/useFragment";
export * from "./core/store/batchedUpdates";

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});

setBatch(unstable_batchedUpdates);
