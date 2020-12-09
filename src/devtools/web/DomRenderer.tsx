import React from "react";

import { createRenderer } from "../common/Explorer";

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
  return React.forwardRef<any, any>(({ style, ...rest }, ref) => {
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

export const Label = styled("div", {
  cursor: "pointer",
  display: "flex",
  color: "white",
  alignItems: "center",
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

export const Expander = ({ isExpanded, style = {}, ...rest }) => (
  <span
    style={{
      display: "inline-block",
      transition: "all .1s ease",
      transform: `rotate(${isExpanded ? 90 : 0}deg) ${
        (style as any).transform || ""
      }`,
      ...style,
    }}
  >
    ▶
  </span>
);

export function cleanLabelForLink(label) {
  return label
    ?.replace(":", "_")
    .replace("(", "_")
    .replace(")", "_")
    .replace(" ", "_");
}

export const DomRenderer = createRenderer({
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
      <Label onClick={() => toggle()} id={`${cleanLabelForLink(label)}`}>
        <Expander
          style={{ color: isSelected ? "yellow" : "white" }}
          isExpanded={isExpanded}
        />{" "}
        <div style={{ width: 8 }} />
        <div style={{ color: isSelected ? "yellow" : "white", flex: 1 }}>
          {label}{" "}
        </div>
        <div style={{ width: 8 }} />
        <Info>{subEntries.length} items</Info>
      </Label>
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
          <Entry key={index}>
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
      <div style={{ marginLeft: 8 }}>
        <Label>{label}:</Label>{" "}
        <Value
          onClick={() => {
            setSelected(value.slice(6));
          }}
        >
          <Link href={`#${cleanLabelForLink(label)}`}>{value.slice(6)}</Link>
        </Value>
      </div>
    );
  },
  renderField: ({ label, setSelected, value }) => {
    return (
      <div style={{ marginLeft: 8 }}>
        <Label>{label}:</Label> <Value>{JSON.stringify(value)}</Value>
      </div>
    );
  },
});

function renderPageExpander({ isExpanded, toggle, index, pageSize }) {
  return (
    <Label onClick={() => toggle()}>
      <Expander isExpanded={isExpanded} /> [{index * pageSize} ...{" "}
      {index * pageSize + pageSize - 1}]
    </Label>
  );
}
function renderPage({ entries, renderEntry, selected, setSelected }) {
  return (
    <SubEntries>
      {entries.map((entry) => renderEntry({ ...entry, selected, setSelected }))}
    </SubEntries>
  );
}
