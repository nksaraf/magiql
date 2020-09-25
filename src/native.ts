// @ts-ignore
import { unstable_batchedUpdates, AppState } from "react-native";
import { setConsole, setFocusHandler } from "react-query";

// @ts-ignore
import { setBatch } from "./core/store/batchedUpdates";

export * from "./core/client";
export * from "./core/fetch";
export * from "./core/exchanges";
export * from "./core/types";
export * from "./core/store/cacheStore";
export * from "./core/store/normalizedCacheStore";
export * from "./hooks";
export * from "./core/store/batchedUpdates";
export * from "./core/graphql-tag";

setConsole({
  log: console.log,
  warn: console.log,
  error: (error) => {},
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
