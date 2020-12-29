"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.useMutationObserver = useMutationObserver;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _notifyManager = require("../core/notifyManager");

var _utils = require("../core/utils");

var _QueryClientProvider = require("./QueryClientProvider");

function useMutationObserver(options, Observer) {
  var queryClient = (0, _QueryClientProvider.useQueryClient)(); // Create mutation observer

  var observerRef = _react.default.useRef();

  var observer = observerRef.current || new Observer(queryClient, options);
  observerRef.current = observer; // Update options

  if (observer.hasListeners()) {
    observer.setOptions(options);
  }

  var _React$useState = _react.default.useState(function () {
    return observer.getCurrentResult();
  }),
      currentResult = _React$useState[0],
      setCurrentResult = _React$useState[1]; // Subscribe to the observer


  _react.default.useEffect(function () {
    return observer.subscribe(_notifyManager.notifyManager.batchCalls(function (result) {
      // Check if the component is still mounted
      if (observer.hasListeners()) {
        setCurrentResult(result);
      }
    }));
  }, [observer]);

  var mutate = _react.default.useCallback(function (variables, mutateOptions) {
    observer.mutate(variables, mutateOptions).catch(_utils.noop);
  }, [observer]);

  if (currentResult.error && observer.options.useErrorBoundary) {
    throw currentResult.error;
  }

  return (0, _extends2.default)({}, currentResult, {
    mutate: mutate,
    mutateAsync: currentResult.mutate
  });
}