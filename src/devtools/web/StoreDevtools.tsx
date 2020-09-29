import React from "react";
import { DomRenderer } from "./DomRenderer";
import { Explorer } from "../common/Explorer";
import { theme } from "../common/theme";
import { useGraphQLStore } from "../../hooks/useGraphQLStore";

export function StoreDevtools() {
  const store = useGraphQLStore();
  const entities = store.useEntities();
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  return (
    <>
      <div
        style={{
          padding: "8px 32px 8px 12px",
          background: theme.backgroundAlt,
        }}
      >
        <input
          value={search}
          style={{
            borderRadius: 8,
            borderColor: "white",
            borderWidth: 2,
            borderStyle: "solid",
            padding: "4px 8px",
            width: "100%",
          }}
          placeholder="Search entities by ID"
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </div>{" "}
      <div
        style={{
          width: "100%",
          flex: 1,
          overflow: "scroll",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "0px 32px 0 12px",
            marginTop: 8,
          }}
        >
          <div>
            {entities.map(([key, val]) => {
              if (key.includes(search) || key === selected) {
                return (
                  <Explorer
                    key={key}
                    value={val}
                    selected={selected}
                    renderer={DomRenderer}
                    label={key}
                    setSelected={setSelected}
                    defaultExpanded={false}
                  />
                );
              } else {
                return (
                  <div key={key} style={{ display: "none" }}>
                    <Explorer
                      key={key}
                      value={val}
                      selected={selected}
                      renderer={DomRenderer}
                      label={key}
                      setSelected={setSelected}
                      defaultExpanded={false}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </>
  );
}
