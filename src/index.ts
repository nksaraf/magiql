import { setConsole } from "react-query";
import { unstable_batchedUpdates } from "react-dom";
import { setBatch } from "./store/batchedUpdates";
export * from "./client";
export * from "./fetch";
export * from "./store/cacheStore";
export * from "./store/normalizedCacheStore";
export * from "./hooks";
export * from "./graphql-tag";

setBatch(unstable_batchedUpdates);

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});
