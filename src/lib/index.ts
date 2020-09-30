import { unstable_batchedUpdates } from "react-dom";
import { setConsole } from "react-query";

import { setBatch } from "../store/batchedUpdates";

export * from "../client";
export * from "../exchanges/composeExchanges";
export * from "../fetchGraphQL";
export * from "../types";
export * from "../store/cacheStore";
export * from "../store/normalizedCacheStore";
export * from "../operation/normalizer";
export * from "../operation/reader";
export * from "../utils";
export * from "../operation/parser";
export * from "../operation/descriptor";
export * from "../tag";
export * from "../hooks/useGraphQLClient";
export * from "../hooks/useGraphQLStore";
export * from "../hooks/useQuery";
export * from "../hooks/useInfiniteQuery";
export * from "../hooks/usePaginatedQuery";
export * from "../hooks/useMutation";
export * from "../hooks/useFragment";
export * from "../store/batchedUpdates";

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});

setBatch(unstable_batchedUpdates);
