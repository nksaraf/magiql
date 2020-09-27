import React from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";

import { Explorer } from "../common/Explorer";
import { useGraphQLClient } from "../../hooks";
import { NativeRenderer } from "./NativeRenderer";

export function StoreDevtools({ onClose }) {
  const client = useGraphQLClient();
  const store = client.useStore();
  const entities = store.useEntities();
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(null);

  const flatlistref = React.useRef<FlatList>();
  const map = entities.reduce(
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
          value={search}
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
          onChangeText={(e) => setSearch(e)}
        />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 16, flex: 1 }}>
        <FlatList
          ref={flatlistref as any}
          data={entities}
          // ListFooterComponent={() => <View style={{ height: 160}}/>}
          keyExtractor={(item) => item[0]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: [key, val] }) => {
            if (
              key.toLowerCase().includes(search.toLowerCase()) ||
              key === selected
            ) {
              return (
                <Explorer
                  key={key}
                  value={val}
                  selected={selected}
                  label={key}
                  renderer={NativeRenderer}
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
                    renderer={NativeRenderer}
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