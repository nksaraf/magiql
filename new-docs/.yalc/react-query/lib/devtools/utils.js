"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.isStale = isStale;
exports.getQueryStatusColor = getQueryStatusColor;
exports.getQueryStatusLabel = getQueryStatusLabel;
exports.styled = styled;
exports.useSafeState = useSafeState;
exports.isServer = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _theme = require("./theme");

var _useMediaQuery = _interopRequireDefault(require("./useMediaQuery"));

// @ts-nocheck
var isServer = typeof window === 'undefined';
exports.isServer = isServer;

function isStale(query) {
  return typeof query.isStale === 'function' ? query.isStale() : query.state.isStale;
}

function getQueryStatusColor(query, theme) {
  return query.state.isFetching ? theme.active : isStale(query) ? theme.warning : !query.observers.length ? theme.gray : theme.success;
}

function getQueryStatusLabel(query) {
  return query.state.isFetching ? 'fetching' : !query.observers.length ? 'inactive' : isStale(query) ? 'stale' : 'fresh';
}

function styled(type, newStyles, queries) {
  if (queries === void 0) {
    queries = {};
  }

  return /*#__PURE__*/_react.default.forwardRef(function (_ref, ref) {
    var style = _ref.style,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["style"]);
    var theme = (0, _theme.useTheme)();
    var mediaStyles = Object.entries(queries).reduce(function (current, _ref2) {
      var key = _ref2[0],
          value = _ref2[1];
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return (0, _useMediaQuery.default)(key) ? (0, _extends2.default)({}, current, typeof value === 'function' ? value(rest, theme) : value) : current;
    }, {});
    return /*#__PURE__*/_react.default.createElement(type, (0, _extends2.default)({}, rest, {
      style: (0, _extends2.default)({}, typeof newStyles === 'function' ? newStyles(rest, theme) : newStyles, style, mediaStyles),
      ref: ref
    }));
  });
}

function useIsMounted() {
  var mountedRef = _react.default.useRef(false);

  var isMounted = _react.default.useCallback(function () {
    return mountedRef.current;
  }, []);

  _react.default[isServer ? 'useEffect' : 'useLayoutEffect'](function () {
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


function useSafeState(initialState) {
  var isMounted = useIsMounted();

  var _React$useState = _react.default.useState(initialState),
      state = _React$useState[0],
      setState = _React$useState[1];

  var safeSetState = _react.default.useCallback(function (value) {
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