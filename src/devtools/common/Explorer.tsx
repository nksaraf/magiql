//  Adapted from https://github.com/tannerlinsley/react-query-devtools/blob/master/src/Explorer.js

import React from "react";

import { constants } from "../../types";
import { theme } from "./theme";

export const createRenderer = ({
  renderSubEntries,
  renderField,
  renderRefField,
  renderExpandableLabel,
  renderWrapper,
  renderPages,
}) => ({
  renderEntry,
  label,
  value,
  selected,
  setSelected,
  isSelected,
  type,
  path,
  subEntries,
  subEntryPages,
  depth,
  isExpanded,
  isRef,
  toggle,
  pageSize,
}) => {
  const [expandedPages, setExpandedPages] = React.useState([]);

  return renderWrapper({
    label,
    value,
    selected,
    setSelected,
    isExpanded,
    children: subEntryPages?.length ? (
      <>
        {renderExpandableLabel({
          toggle,
          label,
          isExpanded,
          isSelected,
          subEntries,
          onClick: () => toggle(),
        })}
        {isExpanded
          ? subEntryPages.length === 1
            ? renderSubEntries({
                subEntries,
                renderEntry,
                selected,
                setSelected,
              })
            : renderPages({
                subEntryPages,
                expandedPages,
                setExpandedPages,
                selected,
                isExpanded,
                pageSize,
                renderEntry,
                setSelected,
              })
          : null}
      </>
    ) : isRef ? (
      renderRefField({
        selected,
        setSelected,
        isSelected,
        value,
        label,
        isRef,
      })
    ) : (
      renderField({
        selected,
        setSelected,
        isSelected,
        value,
        label,
        isRef,
      })
    ),
  });
};

export function Explorer({
  value,
  defaultExpanded,
  renderer,
  pageSize = 100,
  selected,
  setSelected,
  depth = 0,
  label,
  ...rest
}) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  React.useEffect(() => {
    if (selected === label) {
      setIsExpanded(true);
    }
  }, [selected]);

  const toggle = (newValue) => {
    if (selected === label) {
      setSelected(null);
    }
    setIsExpanded((old) => (typeof newValue !== "undefined" ? newValue : !old));
  };

  var { type, subEntries, subEntryPages, path } = resolveEntry({
    value,
    defaultExpanded,
    depth,
    pageSize,
  });

  return renderer({
    type,
    subEntries,
    subEntryPages,
    depth,
    value,
    path,
    selected,
    setSelected,
    isExpanded,
    toggle,
    label,
    isRef: typeof value === "string" && value.startsWith("$REF->"),
    isSelected: selected === label,
    renderEntry: (entry) => (
      <Explorer key={entry.label} renderer={renderer} {...rest} {...entry} />
    ),
    pageSize,
    ...rest,
  });
}

function resolveEntry({
  value,
  defaultExpanded,
  depth,
  pageSize,
}: {
  value: any;
  defaultExpanded: any;
  depth: number;
  pageSize: number;
}) {
  const path = [];
  let type: string = typeof value;
  let subEntries;
  const subEntryPages: any[] = [];
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
            ? value?.[constants.REF_KEY]
              ? asRef(value?.[constants.REF_KEY])
              : value?.[constants.REFS_KEY]
              ? value?.[constants.REFS_KEY].map(asRef)
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
  return { type, subEntries, subEntryPages, path };
}
