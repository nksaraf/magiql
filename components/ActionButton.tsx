import React from "react";

export function ActionButton({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
export function Actions({ children }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}
export function Header({ children }) {
  return (
    <h1>
      <code style={{ fontFamily: "Roboto Mono" }}>{children}</code>
    </h1>
  );
}
