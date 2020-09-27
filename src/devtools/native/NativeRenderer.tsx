import React from "react";
import { createRenderer } from "../common/Explorer";
import { Text, View, TouchableOpacity } from "react-native";

import { theme } from "../common/theme";

export const Entry = ({ style = {}, ...props }) => (
  <View style={[{ paddingBottom: 6 }, style]} {...props} />
);

export const Value = ({ style = {}, ...props }) => (
  <Text
    style={[
      {
        fontSize: 16,
        color: theme.danger,
      },
      style,
    ]}
    {...props}
  />
);

export const Label = ({ style = {}, ...props }) => (
  <Text
    style={[
      {
        fontSize: 16,
        color: "white",
      },
      style,
    ]}
    {...props}
  />
);

export const Link = ({ style = {}, ...props }) => (
  <Text
    style={[
      {
        color: theme.active,
        fontSize: 16,
      },
      style,
    ]}
    {...props}
  />
);

export const SubEntries = ({ style = {}, ...props }) => (
  <View
    style={[
      {
        marginLeft: 14,
        paddingLeft: 8,
        paddingTop: 8,
      },
      style,
    ]}
    {...props}
  />
);

export const Info = ({ style = {}, ...props }) => (
  <Text
    style={[
      {
        fontSize: 14,
        color: "grey",
      },
      style,
    ]}
    {...props}
  />
);

export const Expander = ({ isExpanded, style = {}, ...rest }) => (
  <View
    style={{
      // display: "inline-block",
      // transition: "all .1s ease",
      transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
    }}
  >
    <Text style={{ ...style, fontSize: 16 }}>{isExpanded ? "▼" : "▶"}</Text>
  </View>
);

export function cleanLabelForLink(label) {
  return label
    ?.replace(":", "_")
    .replace("(", "_")
    .replace(")", "_")
    .replace(" ", "_");
}

export const NativeRenderer = createRenderer({
  renderWrapper: ({ label, children }) => {
    return <Entry key={label}>{children}</Entry>;
  },
  renderExpandableLabel: ({
    toggle,
    label,
    isSelected,
    isExpanded,
    subEntries,
  }) => {
    return (
      <TouchableOpacity
        onPress={() => toggle()}
        style={{ flexDirection: "row" }}
      >
        <Expander
          style={{ color: isSelected ? "yellow" : "white" }}
          isExpanded={isExpanded}
        />
        <Label numberOfLines={isExpanded ? undefined : 1}>
          {"  "}
          <Text
            style={{ color: isSelected ? "yellow" : "white" }}
            numberOfLines={1}
          >
            {label}
            {"  "}
            <Info>{subEntries.length} items</Info>
          </Text>
        </Label>
      </TouchableOpacity>
    );
  },
  renderSubEntries: ({ subEntries, renderEntry, selected, setSelected }) => {
    return (
      <SubEntries>
        {subEntries.map((entry) =>
          renderEntry({ ...entry, selected, setSelected })
        )}
      </SubEntries>
    );
  },
  renderPages: ({
    subEntryPages,
    expandedPages,
    setExpandedPages,
    selected,
    isExpanded,
    pageSize,
    renderEntry,
    setSelected,
  }) => {
    return (
      <SubEntries>
        {subEntryPages.map((entries, index) => (
          <Entry>
            {renderPageExpander({
              toggle: () =>
                setExpandedPages((old) =>
                  old.includes(index)
                    ? old.filter((d) => d !== index)
                    : [...old, index]
                ),
              index,
              pageSize,
              isExpanded,
            })}
            {expandedPages.includes(index)
              ? renderPage({
                  entries,
                  selected,
                  setSelected,
                  renderEntry,
                })
              : null}
          </Entry>
        ))}
      </SubEntries>
    );
  },
  renderRefField: ({ setSelected, label, value }) => {
    return (
      <View style={{ flexDirection: "row" }}>
        <Label numberOfLines={1}>
          {label}:{"  "}
        </Label>
        <TouchableOpacity
          onPress={() => {
            setSelected(value.slice(6));
          }}
        >
          <Value numberOfLines={1}>
            <Link>{value.slice(6)}</Link>
          </Value>
        </TouchableOpacity>
      </View>
    );
  },
  renderField: ({ label, setSelected, value }) => {
    return (
      <Label numberOfLines={1}>
        {label}:{"  "}
        <Value>{JSON.stringify(value)}</Value>
      </Label>
    );
  },
});

function renderPageExpander({ isExpanded, toggle, index, pageSize }) {
  return (
    <TouchableOpacity onPress={() => toggle()}>
      <Expander isExpanded={isExpanded} />
      <Label numberOfLines={1}>
        {"  "}[{index * pageSize} ... {index * pageSize + pageSize - 1}]
      </Label>
    </TouchableOpacity>
  );
}
function renderPage({ entries, renderEntry, selected, setSelected }) {
  return (
    <SubEntries>
      {entries.map((entry) => renderEntry({ ...entry, selected, setSelected }))}
    </SubEntries>
  );
}
