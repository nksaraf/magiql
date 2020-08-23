import React, { Suspense } from "react";

import { GraphQLDevtoolsProps } from "./Devtools";

let Devtools: React.FC<GraphQLDevtoolsProps>;

if (typeof window !== "undefined") {
  const GraphQLDevtools: any = React.lazy(() => import("./Devtools"));
  GraphQLDevtools.displayName = "Devtools";
  Devtools = (props: any) => {
    return (
      <Suspense fallback={null}>
        <GraphQLDevtools {...props} />
      </Suspense>
    );
  };
} else {
  Devtools = () => {
    return null as any;
  };
}

Devtools.displayName = "Devtools";

export default Devtools;
