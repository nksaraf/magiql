"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.useIsFetching = useIsFetching;

var _react = _interopRequireDefault(require("react"));

var _notifyManager = require("../core/notifyManager");

var _utils = require("../core/utils");

var _QueryClientProvider = require("./QueryClientProvider");

function useIsFetching(arg1, arg2) {
  var queryClient = (0, _QueryClientProvider.useQueryClient)();

  var _parseFilterArgs = (0, _utils.parseFilterArgs)(arg1, arg2),
      filters = _parseFilterArgs[0];

  var _React$useState = _react.default.useState(queryClient.isFetching(filters)),
      isFetching = _React$useState[0],
      setIsFetching = _React$useState[1];

  var filtersRef = _react.default.useRef(filters);

  filtersRef.current = filters;

  var isFetchingRef = _react.default.useRef(isFetching);

  isFetchingRef.current = isFetching;

  _react.default.useEffect(function () {
    return queryClient.getQueryCache().subscribe(_notifyManager.notifyManager.batchCalls(function () {
      var newIsFetching = queryClient.isFetching(filtersRef.current);

      if (isFetchingRef.current !== newIsFetching) {
        setIsFetching(newIsFetching);
      }
    }));
  }, [queryClient]);

  return isFetching;
}