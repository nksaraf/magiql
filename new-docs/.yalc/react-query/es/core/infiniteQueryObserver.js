import _extends from "@babel/runtime/helpers/esm/extends";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { QueryObserver } from './queryObserver';
import { hasNextPage, hasPreviousPage, infiniteQueryBehavior } from './infiniteQueryBehavior';
export var InfiniteQueryObserver = /*#__PURE__*/function (_QueryObserver) {
  _inheritsLoose(InfiniteQueryObserver, _QueryObserver);

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
    _QueryObserver.prototype.setOptions.call(this, _extends({}, options, {
      behavior: infiniteQueryBehavior()
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

    return _extends({}, result, {
      fetchNextPage: this.fetchNextPage,
      fetchPreviousPage: this.fetchPreviousPage,
      hasNextPage: hasNextPage(this.options, (_result$data = result.data) == null ? void 0 : _result$data.pages),
      hasPreviousPage: hasPreviousPage(this.options, (_result$data2 = result.data) == null ? void 0 : _result$data2.pages),
      isFetchingNextPage: state.isFetching && ((_state$fetchMeta = state.fetchMeta) == null ? void 0 : (_state$fetchMeta$fetc = _state$fetchMeta.fetchMore) == null ? void 0 : _state$fetchMeta$fetc.direction) === 'forward',
      isFetchingPreviousPage: state.isFetching && ((_state$fetchMeta2 = state.fetchMeta) == null ? void 0 : (_state$fetchMeta2$fet = _state$fetchMeta2.fetchMore) == null ? void 0 : _state$fetchMeta2$fet.direction) === 'backward'
    });
  };

  return InfiniteQueryObserver;
}(QueryObserver);