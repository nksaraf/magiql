"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.useBaseQuery = useBaseQuery;

var _react = _interopRequireDefault(require("react"));

var _notifyManager = require("../core/notifyManager");

var _QueryErrorResetBoundary = require("./QueryErrorResetBoundary");

var _QueryClientProvider = require("./QueryClientProvider");

function useBaseQuery(options, Observer) {
  var queryClient = (0, _QueryClientProvider.useQueryClient)();
  var errorResetBoundary = (0, _QueryErrorResetBoundary.useQueryErrorResetBoundary)();
  var defaultedOptions = queryClient.defaultQueryObserverOptions(options); // Include callbacks in batch renders

  if (defaultedOptions.onError) {
    defaultedOptions.onError = _notifyManager.notifyManager.batchCalls(defaultedOptions.onError);
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = _notifyManager.notifyManager.batchCalls(defaultedOptions.onSuccess);
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = _notifyManager.notifyManager.batchCalls(defaultedOptions.onSettled);
  }

  if (defaultedOptions.suspense) {
    // Always set stale time when using suspense to prevent
    // fetching again when directly re-mounting after suspense
    if (typeof defaultedOptions.staleTime !== 'number') {
      defaultedOptions.staleTime = 1000;
    } // Prevent retrying failed query if the error boundary has not been reset yet


    if (!errorResetBoundary.isReset()) {
      defaultedOptions.retryOnMount = false;
    }
  } // Create query observer


  var observerRef = _react.default.useRef();

  var observer = observerRef.current || new Observer(queryClient, defaultedOptions);
  observerRef.current = observer; // Update options

  if (observer.hasListeners()) {
    observer.setOptions(defaultedOptions);
  }

  var currentResult = observer.getCurrentResult(); // Remember latest result to prevent redundant renders

  var latestResultRef = _react.default.useRef(currentResult);

  latestResultRef.current = currentResult;

  var _React$useState = _react.default.useState({}),
      rerender = _React$useState[1]; // Subscribe to the observer


  _react.default.useEffect(function () {
    errorResetBoundary.clearReset();
    return observer.subscribe(_notifyManager.notifyManager.batchCalls(function (result) {
      if (result !== latestResultRef.current) {
        rerender({});
      }
    }));
  }, [observer, errorResetBoundary]); // Handle suspense


  if (observer.options.suspense || observer.options.useErrorBoundary) {
    if (observer.options.suspense && currentResult.isLoading) {
      errorResetBoundary.clearReset();
      var unsubscribe = observer.subscribe();
      throw observer.refetch().finally(unsubscribe);
    }

    if (currentResult.isError) {
      throw currentResult.error;
    }
  }

  return currentResult;
}