// @ts-ignore
import { unstable_batchedUpdates, AppState } from "react-native";
import { setConsole, setFocusHandler } from "react-query";

// @ts-ignore
import { setBatch } from "../store/batchedUpdates";

export * from "../client";
export * from "../fetchGraphQL";
export * from "../exchanges/composeExchanges";
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
