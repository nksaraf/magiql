import { unstable_batchedUpdates } from "react-dom";
import { setConsole } from "react-query";

import { setBatch } from "./core/store/batchedUpdates";

export * from "./core/client";
export * from "./core/fetch";
export * from "./core/store/cacheStore";
export * from "./core/store/normalizedCacheStore";
export * from "./hooks";
export * from "./core/store/batchedUpdates";
export * from "./core/graphql-tag";

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});

setBatch(unstable_batchedUpdates);
