import React, { Suspense } from "react";

import { GraphQLDevtoolsProps } from "./GraphQLDevtools";
export { theme } from "../common/theme";
export let GraphQLDevtools: React.FC<GraphQLDevtoolsProps>;

if (typeof window !== "undefined") {
  const LazyGraphQLDevtools: any = React.lazy(
    () => import("./GraphQLDevtools")
  );
  LazyGraphQLDevtools.displayName = "GraphQLDevtools";
  GraphQLDevtools = (props: any) => {
    return (
      <Suspense fallback={null}>
        <LazyGraphQLDevtools {...props} />
      </Suspense>
    );
  };
} else {
  GraphQLDevtools = () => {
    return null as any;
  };
}

GraphQLDevtools.displayName = "GraphQLDevtools";

export default GraphQLDevtools;
