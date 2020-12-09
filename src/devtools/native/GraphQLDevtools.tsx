import React from "react";
import { View } from "react-native";

import { theme } from "../common/theme";
import { StoreDevtools } from "./StoreDevtools";
export { theme } from "../common/theme";

export interface GraphQLDevtoolsProps {
  initialIsOpen?: boolean;
  position?: string;
  initialTab?: "queries" | "store";
  style?: any;
  onClose?: () => void;
}

export default function GraphQLDevtools({
  initialIsOpen = false,
  initialTab = "store",
  position = "bottom-left",
  style,
  onClose = () => {},
}: GraphQLDevtoolsProps) {
  const [devtools, setDevtools] = React.useState(initialTab);
  const [isOpen, setIsOpen] = React.useState(initialIsOpen);
  return (
    <View style={[{ flex: 1, backgroundColor: theme.background }, style]}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* <View style={{ display: "flex", flexDirection: "row" }}> */}
          {/* <button
                style={{
                  flex: 1,
                  color: devtools === "queries" ? "white" : theme.gray,
                  padding: "12px 0 8px 0",
                  fontSize: 14,
                  borderTopLeftRadius: 12,
                  fontWeight: "bold",
                  backgroundColor:
                    devtools === "queries"
                      ? theme.backgroundAlt
                      : theme.background,
                  border: "none",
                }}
                onClick={() => setDevtools("queries")}
              >
                🚀 Queries
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "12px 0 8px 0",
                  fontWeight: "bold",
                  backgroundColor:
                    devtools === "store"
                      ? theme.backgroundAlt
                      : theme.background,
                  color: devtools === "store" ? "white" : theme.gray,
                  border: "none",
                  fontSize: 14,
                }}
                onClick={() => setDevtools("store")}
              >
                🗄 Store
              </button>
              <button
                style={{
                  color: devtools === "queries" ? "white" : theme.gray,
                  padding: "12px 12px 8px 12px",
                  fontSize: 14,
                  fontWeight: "bold",
                  borderTopRightRadius: 12,
                  backgroundColor: theme.gray + "55",
                  border: "none",
                }}
                onClick={() => setIsOpen(false)}
              >
                
              </button> */}
          {/* </View> */}
          {devtools === "store" && <StoreDevtools onClose={onClose} />}
        </View>
      </View>
    </View>
  );
}
