import { unstable_batchedUpdates } from "react-dom";
import { setConsole } from "react-query";

import { setBatch } from "../src/store/batchedUpdates";

export * from "../src/client";
export * from "../src/exchanges/exchanges";
export * from "../src/fetch";
export * from "../src/types";
export * from "../src/store/cacheStore";
export * from "../src/store/normalizedCacheStore";
export * from "../src/operation/normalizer";
export * from "../src/operation/reader";
export * from "../src/utils";
export * from "../src/operation/parser";
export * from "../src/operation/descriptor";
export * from "../src/tag";
export * from "../src/hooks/useGraphQLClient";
export * from "../src/hooks/useGraphQLStore";
export * from "../src/hooks/useQuery";
export * from "../src/hooks/useInfiniteQuery";
export * from "../src/hooks/usePaginatedQuery";
export * from "../src/hooks/useMutation";
export * from "../src/hooks/useFragment";
export * from "../src/store/batchedUpdates";

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});

setBatch(unstable_batchedUpdates);
