import React, { createContext } from "react";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";

export const EnvironmentContext = createContext<RelayModernEnvironment>(undefined);

export function useEnvironment() {
  return React.useContext(EnvironmentContext);
}
