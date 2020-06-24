import React, { Suspense } from "react";

let Devtools: any;
if (typeof window !== "undefined") {
  const ReactQueryDevtools: any = React.lazy(() =>
    // @ts-ignore
    import("react-query-devtools").then((m) => ({
      default: m.ReactQueryDevtools,
    }))
  );
  Devtools = ({ loading = <></> } = {}) => {
    return (
      <Suspense fallback={loading}>
        <ReactQueryDevtools />
      </Suspense>
    );
  };
} else {
  Devtools = () => {
    return null;
  };
}

Devtools.displayName = "Devtools";
export { Devtools };
export default Devtools;
