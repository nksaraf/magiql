import React, { Suspense } from "react";

import { GraphQLDevtoolsProps } from "./Devtools";

export let GraphQLDevtools: React.FC<GraphQLDevtoolsProps>;

if (typeof window !== "undefined") {
  const LazyGraphQLDevtools: any = React.lazy(() => import("./Devtools"));
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
