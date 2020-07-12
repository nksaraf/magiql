import React from "react";

export interface GraphQLVariables<TVariables> {
  variables?: TVariables;
}

export const getOperationName = (query: string) => {
  const name = /(query|mutation|subscription) ([\w\d-_]+)/.exec(query);
  if (name && name.length && name[2]) {
    return name[2];
  } else {
    throw new Error(
      "Invalid query. Must have a query name, eg. query MyQuery { ... }"
    );
  }
};

export type GraphqlQueryKey<TVariables> = [
  string,
  GraphQLVariables<TVariables>
];

export function useMountedCallback(callback: any) {
  const mounted = React.useRef(false);

  React[typeof window === "undefined" ? "useEffect" : "useLayoutEffect"](() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return React.useCallback(
    (...args) => (mounted.current ? callback(...args) : void 0),
    [callback]
  );
}
