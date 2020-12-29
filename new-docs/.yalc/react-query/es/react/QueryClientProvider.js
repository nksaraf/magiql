import React from 'react';

var QueryClientContext = function () {
  var context = /*#__PURE__*/React.createContext(undefined);

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

export var useQueryClient = function useQueryClient() {
  var queryClient = React.useContext(getQueryClientContext());

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }

  return queryClient;
};
export var QueryClientProvider = function QueryClientProvider(_ref2) {
  var client = _ref2.client,
      children = _ref2.children;
  React.useEffect(function () {
    client.mount();
    return function () {
      client.unmount();
    };
  }, [client]);
  var Context = getQueryClientContext();
  return /*#__PURE__*/React.createElement(Context.Provider, {
    value: client
  }, children);
};