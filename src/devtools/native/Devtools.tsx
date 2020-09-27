import React from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { useGraphQLClient } from "../../hooks";
import Explorer from "./Explorer";
// import Logo from "./RQLogo";
import { theme } from "./theme";

export function StoreDevtools({ onClose }) {
  const client = useGraphQLClient();
  const store = client.useStore();
  const flatlistref = React.useRef<FlatList>();
  const data = store.useEntities();
  const [input, setInput] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const map = data.reduce(
    (arr, item, index) => ({
      ...arr,
      [item[0]]: index,
    }),
    {} as object
  );

  const onSelect = (option) => {
    setSelected(option);
    if (map[option]) {
      flatlistref.current?.scrollToIndex({
        index: map[option],
      });
    }
  };

  return (
    <>
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            🗄 Store
          </Text>
          <TouchableOpacity style={{ padding: 8 }} onPress={onClose}>
            <Text style={{ fontSize: 24, color: "white" }}>✕</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={input}
          style={{
            borderRadius: 8,
            borderColor: "white",
            borderWidth: 2,
            paddingVertical: 8,
            fontSize: 18,
            backgroundColor: "white",
            paddingHorizontal: 8,
            width: "100%",
          }}
          placeholder="Search entities by ID"
          onChangeText={(e) => setInput(e)}
        />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 16, flex: 1 }}>
        <FlatList
          ref={flatlistref as any}
          data={data}
          // ListFooterComponent={() => <View style={{ height: 160}}/>}
          keyExtractor={(item) => item[0]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: [key, val] }) => {
            if (
              key.toLowerCase().includes(input.toLowerCase()) ||
              key === selected
            ) {
              return (
                <Explorer
                  key={key}
                  value={val}
                  selected={selected}
                  label={key}
                  setSelected={onSelect}
                  defaultExpanded={false}
                />
              );
            } else {
              return (
                <View key={key} style={{ display: "none" }}>
                  <Explorer
                    key={key}
                    value={val}
                    selected={selected}
                    label={key}
                    setSelected={onSelect}
                    defaultExpanded={false}
                  />
                </View>
              );
            }
          }}
        />
      </View>
    </>
  );
}

export interface GraphQLDevtoolsProps {
  defaultIsOpen?: boolean;
  position?: string;
  defaultTab?: "queries" | "store";
  style?: any;
  onClose?: () => void;
}

export default function GraphQLDevtools({
  defaultIsOpen = false,
  defaultTab = "store",
  position = "bottom-left",
  style,
  onClose,
}: GraphQLDevtoolsProps) {
  const [devtools, setDevtools] = React.useState(defaultTab);
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);
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
