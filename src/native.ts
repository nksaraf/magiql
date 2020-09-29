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
export * from "./hooks";
export * from "./core/store/batchedUpdates";
export * from "./core/parser";

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
