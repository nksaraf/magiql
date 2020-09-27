// @ts-nocheck
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

import { theme } from "./theme";

export const Entry = ({ style, ...props }) => (
  <View style={[{ paddingBottom: 6 }, style]} {...props} />
);

export const Value = ({ style, ...props }) => (
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

export const Label = ({ style, ...props }) => (
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

export const Link = ({ style, ...props }) => (
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

export const SubEntries = ({ style, ...props }) => (
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

export const Info = ({ style, ...props }) => (
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

export const Expander = ({ expanded, style = {}, ...rest }) => (
  <View
    style={{
      // display: "inline-block",
      // transition: "all .1s ease",
      transform: [{ rotate: expanded ? "90deg" : "0deg" }],
    }}
  >
    <Text style={{ ...style, fontSize: 16 }}>{expanded ? "▼" : "▶"}</Text>
  </View>
);




const DefaultRenderer = ({
  handleEntry,
  label,
  style,
  value,
  selected,
  setSelected,
  // path,
  subEntries,
  subEntryPages,
  // depth,
  expanded,
  toggle,
  pageSize,
}) => {
  const [expandedPages, setExpandedPages] = React.useState([]);

  return (
    <Entry key={label} style={style}>
      {subEntryPages?.length ? (
        <>
          <TouchableOpacity
            onPress={() => toggle()}
            style={{ flexDirection: "row" }}
          >
            <Expander
              style={{ color: selected === label ? "yellow" : "white" }}
              expanded={expanded}
            />
            <Label numberOfLines={expanded ? undefined : 1}>
              {"  "}
              <Text
                style={{ color: selected === label ? "yellow" : "white" }}
                numberOfLines={1}
              >
                {label}
                {"  "}
                <Info>{subEntries.length} items</Info>
              </Text>
            </Label>
          </TouchableOpacity>
          {expanded ? (
            subEntryPages.length === 1 ? (
              <SubEntries>
                {subEntries.map((entry) =>
                  handleEntry({ ...entry, selected, setSelected })
                )}
              </SubEntries>
            ) : (
              <SubEntries>
                {subEntryPages.map((entries, index) => (
                  <Entry>
                    <Expander expanded={expanded} />
                    <Label
                      numberOfLines={1}
                      onClick={() =>
                        setExpandedPages((old) =>
                          old.includes(index)
                            ? old.filter((d) => d !== index)
                            : [...old, index]
                        )
                      }
                    >
                      {"  "}[{index * pageSize} ...{" "}
                      {index * pageSize + pageSize - 1}]
                    </Label>
                    {expandedPages.includes(index) ? (
                      <SubEntries>
                        {entries.map((entry) =>
                          handleEntry({ ...entry, selected, setSelected })
                        )}
                      </SubEntries>
                    ) : null}
                  </Entry>
                ))}
              </SubEntries>
            )
          ) : null}
        </>
      ) : typeof value === "string" && value.startsWith("$REF->") ? (
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
      ) : (
        <Label numberOfLines={1}>
          {label}:{"  "}
          <Value>{JSON.stringify(value)}</Value>
        </Label>
      )}
    </Entry>
  );
};

export default function Explorer({
  value,
  defaultExpanded,
  renderer = DefaultRenderer,
  pageSize = 100,
  selected,
  setSelected,
  depth = 0,
  ...rest
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  React.useEffect(() => {
    if (selected === rest.label) {
      setExpanded(true);
    }
  }, [selected]);

  const toggle = (set) => {
    if (selected === rest.label) {
      setSelected(null);
    }
    setExpanded((old) => (typeof set !== "undefined" ? set : !old));
  };

  const path = [];

  let type = typeof value;
  let subEntries;
  const subEntryPages = [];

  const makeProperty = (sub) => {
    const newPath = path.concat(sub.label);
    const subDefaultExpanded =
      defaultExpanded === true
        ? { [sub.label]: true }
        : defaultExpanded?.[sub.label];
    return {
      ...sub,
      path: newPath,
      depth: depth + 1,
      defaultExpanded: subDefaultExpanded,
    };
  };

  if (Array.isArray(value)) {
    type = "array";
    subEntries = value.map((d, i) =>
      makeProperty({
        label: i,
        value: d,
      })
    );
  } else if (typeof value === "object" && value !== null) {
    const asRef = (map) => {
      return `$REF->${map}`;
    };
    type = "object";
    subEntries = Object.entries(value).map(([label, value]) =>
      makeProperty({
        label,
        value:
          value === null
            ? null
            : typeof value === "object"
            ? value["__ref"]
              ? asRef(value["__ref"])
              : value["__refs"]
              ? value["__refs"].map(asRef)
              : value
            : value,
      })
    );
  }

  if (subEntries) {
    let i = 0;

    while (i < subEntries.length) {
      subEntryPages.push(subEntries.slice(i, i + pageSize));
      i = i + pageSize;
    }
  }

  return renderer({
    handleEntry: (entry) => (
      <Explorer key={entry.label} renderer={renderer} {...rest} {...entry} />
    ),
    type,
    subEntries,
    subEntryPages,
    depth,
    value,
    path,
    selected,
    setSelected,
    expanded,
    toggle,
    pageSize,
    ...rest,
  });
}
