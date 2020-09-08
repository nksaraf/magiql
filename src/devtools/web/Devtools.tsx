import React from "react";
import Draggable from "react-draggable";
import { ReactQueryCacheProvider } from "react-query";
import { ReactQueryDevtoolsPanel } from "react-query-devtools";

import { useClient } from "../../hooks";
import Explorer, { ThemeProvider } from "./Explorer";
import Logo from "./RQLogo";
import { theme } from "./theme";

export function StoreDevtools() {
  const client = useClient();
  const store = client.useStore();
  const data = store.useEntities();
  const [input, setInput] = React.useState("");
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
          value={input}
          style={{
            borderRadius: 8,
            borderColor: "white",
            borderWidth: 2,
            borderStyle: "solid",
            padding: "4px 8px",
            width: "100%",
          }}
          placeholder="Search entities by ID"
          onChange={(e) => setInput(e.currentTarget.value)}
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
        {/* <div style={{ maxHeight: "100%" }}> */}
        <div
          style={{
            padding: "0px 32px 0 12px",
            marginTop: 8,
          }}
        >
          <div>
            {Object.entries(data).map(([key, val]) => {
              if (key.includes(input) || key === selected) {
                return (
                  <Explorer
                    key={key}
                    value={val}
                    selected={selected}
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
        {/* </div> */}
      </div>
    </>
  );
}

export function QueriesDevtools() {
  const client = useClient();
  return (
    <ReactQueryCacheProvider queryCache={client.cache}>
      <div
        style={{
          overflow: "scroll",
          width: "100%",
          flex: 1,
          borderRadius: 8,
        }}
      >
        <ReactQueryDevtoolsPanel />
      </div>
    </ReactQueryCacheProvider>
  );
}

export interface GraphQLDevtoolsProps {
  defaultIsOpen?: boolean;
  position?: string;
  defaultTab?: "queries" | "store";
}

export default function GraphQLDevtools({
  defaultIsOpen = false,
  defaultTab = "queries",
  position = "bottom-left",
}: GraphQLDevtoolsProps) {
  const [devtools, setDevtools] = React.useState(defaultTab);
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);
  return (
    <ThemeProvider theme={theme}>
      {!isOpen && (
        <button
          // {...otherToggleButtonProps}
          aria-label="Open React Query Devtools"
          onClick={() => {
            setIsOpen(true);
          }}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            position: "fixed",
            bottom: "0",
            right: "0",
            zIndex: 99999,
            display: "inline-flex",
            fontSize: "1.5rem",
            margin: ".5rem",
            cursor: "pointer",
            ...(position === "top-right"
              ? {
                  top: "0",
                  right: "0",
                }
              : position === "top-left"
              ? {
                  top: "0",
                  left: "0",
                }
              : position === "bottom-right"
              ? {
                  bottom: "0",
                  right: "0",
                }
              : {
                  bottom: "0",
                  left: "0",
                }),
          }}
        >
          <Logo aria-hidden />
        </button>
      )}
      <Draggable>
        <div
          style={{
            display: isOpen ? "block" : "none",
            right: 20,
            zIndex: 99999,
            top: 20,
            position: "fixed",
          }}
        >
          <div
            style={{
              height: 480,
              width: 400,
              position: "relative",
              borderRadius: 12,
              background: theme.background,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <button
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
                  <svg
                    viewBox="0 0 512 512.001"
                    width={12}
                    height={12}
                    fill="white"
                  >
                    <path d="M284.284 256L506.142 34.142c7.811-7.81 7.811-20.474 0-28.284-7.811-7.811-20.474-7.811-28.284 0L256 227.716 34.142 5.858c-7.811-7.811-20.474-7.811-28.284 0-7.811 7.81-7.811 20.474 0 28.284L227.716 256 5.858 477.858c-7.811 7.811-7.811 20.474 0 28.284 7.81 7.81 20.473 7.811 28.284 0L256 284.284l221.858 221.858c7.81 7.81 20.473 7.811 28.284 0s7.811-20.474 0-28.284L284.284 256z" />
                  </svg>
                </button>
              </div>

              {devtools === "queries" && <QueriesDevtools />}
              {devtools === "store" && <StoreDevtools />}
            </div>
          </div>
        </div>
      </Draggable>
    </ThemeProvider>
  );
}
