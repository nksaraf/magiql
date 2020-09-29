// @ts-ignore
import { unstable_batchedUpdates, AppState } from "react-native";
import { setConsole, setFocusHandler } from "react-query";

// @ts-ignore
import { setBatch } from "./core/store/batchedUpdates";

export * from "./core/graphQLClient";
export * from "./core/fetchGraphQL";
export * from "./core/exchanges";
export * from "./core/types";
export * from "./core/store/cacheStore";
export * from "./core/store/normalizedCacheStore";
export * from "./core/normalizer";
export * from "./core/reader";
export * from "./utils";
export * from "./core/parser";
export * from "./core/operation";
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
