import { setConsole } from "react-query";

export * from "./client";
export * from "./fetch";
export * from "./store";
export * from "./hooks";
export * from "./graphql-tag";

setConsole({
  log: console.log,
  warn: console.log,
  error: console.log,
});
