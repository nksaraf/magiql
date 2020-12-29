import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { getQueryKeyHashFn, matchQuery, parseFilterArgs } from './utils';
import { Query } from './query';
import { notifyManager } from './notifyManager';
import { Subscribable } from './subscribable'; // TYPES

// CLASS
export var QueryCache = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(QueryCache, _Subscribable);

  function QueryCache(config) {
    var _this;

    _this = _Subscribable.call(this) || this;
    _this.config = config || {};
    _this.queries = [];
    _this.queriesMap = {};
    return _this;
  }

  var _proto = QueryCache.prototype;

  _proto.build = function build(client, options, state) {
    var _options$queryHash;

    var hashFn = getQueryKeyHashFn(options);
    var queryKey = options.queryKey;
    var queryHash = (_options$queryHash = options.queryHash) != null ? _options$queryHash : hashFn(queryKey);
    var query = this.get(queryHash);

    if (!query) {
      query = new Query({
        cache: this,
        queryKey: queryKey,
        queryHash: queryHash,
        options: client.defaultQueryOptions(options),
        state: state,
        defaultOptions: client.getQueryDefaults(queryKey)
      });
      this.add(query);
    }

    return query;
  };

  _proto.add = function add(query) {
    if (!this.queriesMap[query.queryHash]) {
      this.queriesMap[query.queryHash] = query;
      this.queries.push(query);
      this.notify(query);
    }
  };

  _proto.remove = function remove(query) {
    var queryInMap = this.queriesMap[query.queryHash];

    if (queryInMap) {
      query.destroy();
      this.queries = this.queries.filter(function (x) {
        return x !== query;
      });

      if (queryInMap === query) {
        delete this.queriesMap[query.queryHash];
      }

      this.notify(query);
    }
  };

  _proto.clear = function clear() {
    var _this2 = this;

    notifyManager.batch(function () {
      _this2.queries.forEach(function (query) {
        _this2.remove(query);
      });
    });
  };

  _proto.get = function get(queryHash) {
    return this.queriesMap[queryHash];
  };

  _proto.getAll = function getAll() {
    return this.queries;
  };

  _proto.find = function find(arg1, arg2) {
    var _parseFilterArgs = parseFilterArgs(arg1, arg2),
        filters = _parseFilterArgs[0];

    return this.queries.find(function (query) {
      return matchQuery(filters, query);
    });
  };

  _proto.findAll = function findAll(arg1, arg2) {
    var _parseFilterArgs2 = parseFilterArgs(arg1, arg2),
        filters = _parseFilterArgs2[0];

    return filters ? this.queries.filter(function (query) {
      return matchQuery(filters, query);
    }) : this.queries;
  };

  _proto.notify = function notify(query) {
    var _this3 = this;

    notifyManager.batch(function () {
      _this3.listeners.forEach(function (listener) {
        listener(query);
      });
    });
  };

  _proto.onFocus = function onFocus() {
    var _this4 = this;

    notifyManager.batch(function () {
      _this4.queries.forEach(function (query) {
        query.onFocus();
      });
    });
  };

  _proto.onOnline = function onOnline() {
    var _this5 = this;

    notifyManager.batch(function () {
      _this5.queries.forEach(function (query) {
        query.onOnline();
      });
    });
  };

  return QueryCache;
}(Subscribable);