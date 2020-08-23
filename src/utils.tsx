import React from "react";

export function createState<T extends string>(state: T): Stated<T> {
  function whenIn<V = any>(props: { [k in T]?: V }) {
    return props[state] ?? null;
  }
  function is(matchState: T) {
    return matchState === state;
  }

  return {
    whenIn,
    is,
    state,
  };
}

export interface Stated<T extends string> {
  whenIn: <V>(props: { [k in T]?: V }) => V | null;
  is: (state: T) => boolean;
  set?: React.Dispatch<React.SetStateAction<T>>;
  state: T;
}

export function useState<T extends string>(
  initialState: T
): [Stated<T>, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState(initialState);
  return [
    {
      ...createState(state),
      set: setState,
    },
    setState,
  ];
}

export const isServer = typeof window === "undefined";
export function throwError() {
  return () => {
    throw new Error("unimplemented");
  };
}

export function useMountedCallback<T extends Function>(callback: T): T {
  const mounted = React.useRef(false);

  React[isServer ? "useEffect" : "useLayoutEffect"](() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (React.useCallback(
    (...args: any[]) => (mounted.current ? callback(...args) : void 0),
    [callback]
  ) as any) as T;
}

export function useRerenderer() {
  const rerender = useMountedCallback(React.useState<unknown>()[1]);
  return React.useCallback(() => rerender({}), [rerender]);
}
