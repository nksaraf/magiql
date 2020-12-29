import React from 'react';
import { useQueryClient } from '../react';
import { hydrate } from './hydration';
export function useHydrate(state, options) {
  var queryClient = useQueryClient();
  var optionsRef = React.useRef(options);
  optionsRef.current = options; // Running hydrate again with the same queries is safe,
  // it wont overwrite or initialize existing queries,
  // relying on useMemo here is only a performance optimization

  React.useMemo(function () {
    if (state) {
      hydrate(queryClient, state, optionsRef.current);
    }
  }, [queryClient, state]);
}
export var Hydrate = function Hydrate(_ref) {
  var children = _ref.children,
      options = _ref.options,
      state = _ref.state;
  useHydrate(state, options);
  return children;
};