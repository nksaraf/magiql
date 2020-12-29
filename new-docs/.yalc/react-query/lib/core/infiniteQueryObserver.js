"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.InfiniteQueryObserver = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _queryObserver = require("./queryObserver");

var _infiniteQueryBehavior = require("./infiniteQueryBehavior");

var InfiniteQueryObserver = /*#__PURE__*/function (_QueryObserver) {
  (0, _inheritsLoose2.default)(InfiniteQueryObserver, _QueryObserver);

  // Type override
  // Type override
  // Type override
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  function InfiniteQueryObserver(client, options) {
    return _QueryObserver.call(this, client, options) || this;
  }

  var _proto = InfiniteQueryObserver.prototype;

  _proto.bindMethods = function bindMethods() {
    _QueryObserver.prototype.bindMethods.call(this);

    this.fetchNextPage = this.fetchNextPage.bind(this);
    this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
  };

  _proto.setOptions = function setOptions(options) {
    _QueryObserver.prototype.setOptions.call(this, (0, _extends2.default)({}, options, {
      behavior: (0, _infiniteQueryBehavior.infiniteQueryBehavior)()
    }));
  };

  _proto.fetchNextPage = function fetchNextPage(options) {
    return this.fetch({
      cancelRefetch: true,
      throwOnError: options == null ? void 0 : options.throwOnError,
      meta: {
        fetchMore: {
          direction: 'forward',
          pageParam: options == null ? void 0 : options.pageParam
        }
      }
    });
  };

  _proto.fetchPreviousPage = function fetchPreviousPage(options) {
    return this.fetch({
      cancelRefetch: true,
      throwOnError: options == null ? void 0 : options.throwOnError,
      meta: {
        fetchMore: {
          direction: 'backward',
          pageParam: options == null ? void 0 : options.pageParam
        }
      }
    });
  };

  _proto.getNewResult = function getNewResult(willFetch) {
    var _result$data, _result$data2, _state$fetchMeta, _state$fetchMeta$fetc, _state$fetchMeta2, _state$fetchMeta2$fet;

    var _this$getCurrentQuery = this.getCurrentQuery(),
        state = _this$getCurrentQuery.state;

    var result = _QueryObserver.prototype.getNewResult.call(this, willFetch);

    return (0, _extends2.default)({}, result, {
      fetchNextPage: this.fetchNextPage,
      fetchPreviousPage: this.fetchPreviousPage,
      hasNextPage: (0, _infiniteQueryBehavior.hasNextPage)(this.options, (_result$data = result.data) == null ? void 0 : _result$data.pages),
      hasPreviousPage: (0, _infiniteQueryBehavior.hasPreviousPage)(this.options, (_result$data2 = result.data) == null ? void 0 : _result$data2.pages),
      isFetchingNextPage: state.isFetching && ((_state$fetchMeta = state.fetchMeta) == null ? void 0 : (_state$fetchMeta$fetc = _state$fetchMeta.fetchMore) == null ? void 0 : _state$fetchMeta$fetc.direction) === 'forward',
      isFetchingPreviousPage: state.isFetching && ((_state$fetchMeta2 = state.fetchMeta) == null ? void 0 : (_state$fetchMeta2$fet = _state$fetchMeta2.fetchMore) == null ? void 0 : _state$fetchMeta2$fet.direction) === 'backward'
    });
  };

  return InfiniteQueryObserver;
}(_queryObserver.QueryObserver);

exports.InfiniteQueryObserver = InfiniteQueryObserver;