import React from "react";
import { isServer } from "../utils";

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
