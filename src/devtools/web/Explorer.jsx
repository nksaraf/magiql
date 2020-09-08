//  Adapted from https://github.com/tannerlinsley/react-query-devtools/blob/master/src/Explorer.js

import React from "react";

import { constants } from "../../core/types";
import { theme } from "./theme";

const ThemeContext = React.createContext({});

export function ThemeProvider({ theme, ...rest }) {
  return <ThemeContext.Provider value={theme} {...rest} />;
}

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function useMediaQuery(query) {
  // Keep track of the preference in state, start with the current match
  const [isMatch, setIsMatch] = React.useState(
    () => window.matchMedia && window.matchMedia(query).matches
  );

  // Watch for changes
  React.useEffect(() => {
    if (!window.matchMedia) {
      return;
    }

    // Create a matcher
    const matcher = window.matchMedia(query);

    // Create our handler
    const onChange = ({ matches }) => setIsMatch(matches);

    // Listen for changes
    matcher.addListener(onChange);

    return () => {
      // Stop listening for changes
      matcher.removeListener(onChange);
    };
  }, [isMatch, query, setIsMatch]);

  return isMatch;
}

export function styled(type, newStyles, queries = {}) {
  return React.forwardRef(({ style, ...rest }, ref) => {
    const theme = useTheme();

    const mediaStyles = Object.entries(queries).reduce(
      (current, [key, value]) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useMediaQuery(key)
          ? {
              ...current,
              ...(typeof value === "function" ? value(rest, theme) : value),
            }
          : current;
      },
      {}
    );

    return React.createElement(type, {
      ...rest,
      style: {
        ...(typeof newStyles === "function"
          ? newStyles(rest, theme)
          : newStyles),
        ...style,
        ...mediaStyles,
      },
      ref,
    });
  });
}

export const Entry = styled("div", {
  fontFamily: "Menlo, monospace",
  fontSize: "0.9rem",
  lineHeight: "1.7",
  outline: "none",
});

export const Label = styled("span", {
  cursor: "pointer",
  color: "white",
});

export const Value = styled("span", (props, theme) => ({
  color: theme.danger,
}));

export const Link = styled("a", (props, theme) => ({
  color: theme.active,
}));

export const SubEntries = styled("div", {
  marginLeft: ".1rem",
  paddingLeft: "1rem",
  borderLeft: "2px solid rgba(0,0,0,.15)",
});

export const Info = styled("span", {
  color: "grey",
  fontSize: ".7rem",
});

export const Expander = ({ expanded, style = {}, ...rest }) => (
  <span
    style={{
      display: "inline-block",
      transition: "all .1s ease",
      transform: `rotate(${expanded ? 90 : 0}deg) ${style.transform || ""}`,
      ...style,
    }}
  >
    ▶
  </span>
);

const DefaultRenderer = ({
  handleEntry,
  label,
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
    <Entry key={label}>
      {subEntryPages?.length ? (
        <>
          <Label
            onClick={() => toggle()}
            id={`${label
              ?.replace(":", "_")
              .replace("(", "_")
              .replace(")", "_")
              .replace(" ", "_")}`}
          >
            <Expander
              style={{ color: selected === label ? "yellow" : "white" }}
              expanded={expanded}
            />{" "}
            <span style={{ color: selected === label ? "yellow" : "white" }}>
              {label}{" "}
            </span>
            <Info>{subEntries.length} items</Info>
          </Label>
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
                  <div key={index}>
                    <Entry>
                      <Label
                        onClick={() =>
                          setExpandedPages((old) =>
                            old.includes(index)
                              ? old.filter((d) => d !== index)
                              : [...old, index]
                          )
                        }
                      >
                        <Expander expanded={expanded} /> [{index * pageSize} ...{" "}
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
                  </div>
                ))}
              </SubEntries>
            )
          ) : null}
        </>
      ) : (
        <div style={{ marginLeft: 8 }}>
          <Label>{label}:</Label>{" "}
          {typeof value === "string" && value.startsWith("$REF->") ? (
            <Value
              onClick={() => {
                setSelected(value.slice(6));
              }}
            >
              <Link
                href={`#${value
                  .slice(6)
                  .replace(":", "_")
                  .replace("(", "_")
                  .replace(")", "_")
                  .replace(" ", "_")}`}
              >
                {value.slice(6)}
              </Link>
            </Value>
          ) : (
            <Value>{JSON.stringify(value)}</Value>
          )}
        </div>
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
            ? value[constants.REF_KEY]
              ? asRef(value[constants.REF_KEY])
              : value[constants.REFS_KEY]
              ? value[constants.REFS_KEY].map(asRef)
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
