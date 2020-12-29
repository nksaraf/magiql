"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.QueryClientProvider = exports.useQueryClient = void 0;

var _react = _interopRequireDefault(require("react"));

var QueryClientContext = function () {
  var context = /*#__PURE__*/_react.default.createContext(undefined);

  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.ReactQueryClientContext = context;
  }

  return context;
}();

function getQueryClientContext() {
  var _ref;

  return typeof window !== 'undefined' ? // @ts-ignore
  (_ref = window.ReactQueryClientContext) != null ? _ref : QueryClientContext : QueryClientContext;
}

var useQueryClient = function useQueryClient() {
  var queryClient = _react.default.useContext(getQueryClientContext());

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }

  return queryClient;
};

exports.useQueryClient = useQueryClient;

var QueryClientProvider = function QueryClientProvider(_ref2) {
  var client = _ref2.client,
      children = _ref2.children;

  _react.default.useEffect(function () {
    client.mount();
    return function () {
      client.unmount();
    };
  }, [client]);

  var Context = getQueryClientContext();
  return /*#__PURE__*/_react.default.createElement(Context.Provider, {
    value: client
  }, children);
};

exports.QueryClientProvider = QueryClientProvider;