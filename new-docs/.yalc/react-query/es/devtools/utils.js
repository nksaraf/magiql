import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
// @ts-nocheck
import React from 'react';
import { useTheme } from './theme';
import useMediaQuery from './useMediaQuery';
export var isServer = typeof window === 'undefined';
export function isStale(query) {
  return typeof query.isStale === 'function' ? query.isStale() : query.state.isStale;
}
export function getQueryStatusColor(query, theme) {
  return query.state.isFetching ? theme.active : isStale(query) ? theme.warning : !query.observers.length ? theme.gray : theme.success;
}
export function getQueryStatusLabel(query) {
  return query.state.isFetching ? 'fetching' : !query.observers.length ? 'inactive' : isStale(query) ? 'stale' : 'fresh';
}
export function styled(type, newStyles, queries) {
  if (queries === void 0) {
    queries = {};
  }

  return /*#__PURE__*/React.forwardRef(function (_ref, ref) {
    var style = _ref.style,
        rest = _objectWithoutPropertiesLoose(_ref, ["style"]);

    var theme = useTheme();
    var mediaStyles = Object.entries(queries).reduce(function (current, _ref2) {
      var key = _ref2[0],
          value = _ref2[1];
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useMediaQuery(key) ? _extends({}, current, typeof value === 'function' ? value(rest, theme) : value) : current;
    }, {});
    return /*#__PURE__*/React.createElement(type, _extends({}, rest, {
      style: _extends({}, typeof newStyles === 'function' ? newStyles(rest, theme) : newStyles, style, mediaStyles),
      ref: ref
    }));
  });
}

function useIsMounted() {
  var mountedRef = React.useRef(false);
  var isMounted = React.useCallback(function () {
    return mountedRef.current;
  }, []);
  React[isServer ? 'useEffect' : 'useLayoutEffect'](function () {
    mountedRef.current = true;
    return function () {
      mountedRef.current = false;
    };
  }, []);
  return isMounted;
}
/**
 * This hook is a safe useState version which schedules state updates in microtasks
 * to prevent updating a component state while React is rendering different components
 * or when the component is not mounted anymore.
 */


export function useSafeState(initialState) {
  var isMounted = useIsMounted();

  var _React$useState = React.useState(initialState),
      state = _React$useState[0],
      setState = _React$useState[1];

  var safeSetState = React.useCallback(function (value) {
    scheduleMicrotask(function () {
      if (isMounted()) {
        setState(value);
      }
    });
  }, [isMounted]);
  return [state, safeSetState];
}
/**
 * Schedules a microtask.
 * This can be useful to schedule state updates after rendering.
 */

function scheduleMicrotask(callback) {
  Promise.resolve().then(callback).catch(function (error) {
    return setTimeout(function () {
      throw error;
    });
  });
}