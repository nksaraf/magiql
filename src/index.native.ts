// @ts-ignore
import { unstable_batchedUpdates, AppState } from "react-native";
import { setConsole, setFocusHandler } from "react-query";

// @ts-ignore
import { setBatch } from "./utils/batchedUpdates";

export * from "./client/client";
export * from "./fetch/fetchGraphQL";
export * from "./exchanges";
export * from "./types";
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
  warn: console.warn,
  error: console.warn,
});

setBatch(unstable_batchedUpdates);

setFocusHandler((handleFocus) => {
  const handleAppStateChange = (appState) => {
    if (appState === "active") {
      handleFocus();
    }
  };

  AppState.addEventListener("change", handleAppStateChange);

  return () => AppState.removeEventListener("change", handleAppStateChange);
});
