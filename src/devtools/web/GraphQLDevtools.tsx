import React from "react";
import Draggable from "react-draggable";

import { theme } from "../common/theme";
import { ThemeProvider, DomRenderer } from "./DomRenderer";
import { QueriesDevtools } from "./QueriesDevtools";
import Logo from "./RQLogo";
import { StoreDevtools } from "./StoreDevtools";

export interface GraphQLDevtoolsProps {
  defaultIsOpen?: boolean;
  position?: string;
  defaultTab?: "queries" | "store";
  style?: any;
  buttonProps?: any;
}

function MagiqlDevtoolsButton({
  isOpen,
  setIsOpen,
  position,
  style,
  fixed,
  ...props
}) {
  return (
    !isOpen && (
      <button
        {...props}
        aria-label="Open Magiql Devtools"
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
          ...style,
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
            : position === "bottom-left"
            ? {
                bottom: "0",
                left: "0",
              }
            : {
                position,
              }),
        }}
      >
        <Logo aria-hidden />
      </button>
    )
  );
}

export default function GraphQLDevtools({
  defaultIsOpen = false,
  defaultTab = "queries",
  position = "bottom-left",
  buttonProps = {},
  style = {},
}: GraphQLDevtoolsProps) {
  const [devtools, setDevtools] = React.useState(defaultTab);
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);
  return (
    <ThemeProvider theme={theme}>
      {!isOpen && (
        <MagiqlDevtoolsButton
          {...{ ...buttonProps, position, style: { ...buttonProps.style } }}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
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
              ...style,
            }}
          >
            <div
              style={{
                display: "flex",
                paddingTop: 8,
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div
                  style={{
                    display: "grid",
                    placeItems: "flex-start",
                    padding: "4px 12px",
                  }}
                >
                  <Logo width={24} height={24} aria-hidden />
                </div>
                <button
                  style={{
                    flex: 1,
                    color: devtools === "queries" ? "white" : theme.gray,
                    padding: "6px 0px",
                    fontSize: 14,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
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
                    padding: "6px 0px",
                    fontWeight: "bold",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
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
                <div
                  style={{
                    display: "grid",
                    placeItems: "flex-start",
                    padding: "4px 12px",
                  }}
                >
                  <button
                    style={{
                      color: devtools === "queries" ? "white" : theme.gray,
                      padding: "4px",
                      fontWeight: "bold",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 100,
                      backgroundColor: "#d32f2f",
                      border: "none",
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg
                      viewBox="0 0 512 512"
                      width={6}
                      height={6}
                      fill="white"
                    >
                      <path d="M284.284 256L506.142 34.142c7.811-7.81 7.811-20.474 0-28.284-7.811-7.811-20.474-7.811-28.284 0L256 227.716 34.142 5.858c-7.811-7.811-20.474-7.811-28.284 0-7.811 7.81-7.811 20.474 0 28.284L227.716 256 5.858 477.858c-7.811 7.811-7.811 20.474 0 28.284 7.81 7.81 20.473 7.811 28.284 0L256 284.284l221.858 221.858c7.81 7.81 20.473 7.811 28.284 0s7.811-20.474 0-28.284L284.284 256z" />
                    </svg>
                  </button>
                </div>
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
