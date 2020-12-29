"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.useQueries = useQueries;
exports.useQueriesObserver = useQueriesObserver;

var _react = _interopRequireDefault(require("react"));

var _core = require("../core");

var _notifyManager = require("../core/notifyManager");

var _queriesObserver = require("../core/queriesObserver");

var _QueryClientProvider = require("./QueryClientProvider");

function useQueries(queries) {
  return useQueriesObserver(queries, _core.QueryObserver);
}

function useQueriesObserver(queries, Observer) {
  var queryClient = (0, _QueryClientProvider.useQueryClient)(); // Create queries observer

  var observerRef = _react.default.useRef();

  var observer = observerRef.current || new _queriesObserver.QueriesObserver(queryClient, queries, Observer);
  observerRef.current = observer; // Update queries

  if (observer.hasListeners()) {
    observer.setQueries(queries);
  }

  var _React$useState = _react.default.useState(function () {
    return observer.getCurrentResult();
  }),
      currentResult = _React$useState[0],
      setCurrentResult = _React$useState[1]; // Subscribe to the observer


  _react.default.useEffect(function () {
    return observer.subscribe(_notifyManager.notifyManager.batchCalls(setCurrentResult));
  }, [observer]);

  return currentResult;
}