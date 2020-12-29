"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.QueriesObserver = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _utils = require("./utils");

var _notifyManager = require("./notifyManager");

var _queryObserver = require("./queryObserver");

var _subscribable = require("./subscribable");

var QueriesObserver = /*#__PURE__*/function (_Subscribable) {
  (0, _inheritsLoose2.default)(QueriesObserver, _Subscribable);

  function QueriesObserver(client, queries, Observer) {
    var _this;

    if (Observer === void 0) {
      Observer = _queryObserver.QueryObserver;
    }

    _this = _Subscribable.call(this) || this;
    _this.Observer = Observer;
    _this.client = client;
    _this.queries = queries || [];
    _this.result = [];
    _this.observers = []; // Subscribe to queries

    _this.updateObservers();

    return _this;
  }

  var _proto = QueriesObserver.prototype;

  _proto.onSubscribe = function onSubscribe() {
    var _this2 = this;

    if (this.listeners.length === 1) {
      this.observers.forEach(function (observer) {
        observer.subscribe(function (result) {
          _this2.onUpdate(observer, result);
        });
      });
    }
  };

  _proto.onUnsubscribe = function onUnsubscribe() {
    if (!this.listeners.length) {
      this.destroy();
    }
  };

  _proto.destroy = function destroy() {
    this.listeners = [];
    this.observers.forEach(function (observer) {
      observer.destroy();
    });
  };

  _proto.setQueries = function setQueries(queries) {
    this.queries = queries;
    this.updateObservers();
  };

  _proto.getCurrentResult = function getCurrentResult() {
    return this.result;
  };

  _proto.updateObservers = function updateObservers() {
    var _this3 = this;

    var hasIndexChange = false;
    var prevObservers = this.observers;
    var newObservers = this.queries.map(function (options, i) {
      var observer = prevObservers[i];

      var defaultedOptions = _this3.client.defaultQueryObserverOptions(options);

      var hashFn = (0, _utils.getQueryKeyHashFn)(defaultedOptions);
      defaultedOptions.queryHash = hashFn(defaultedOptions.queryKey);

      if (!observer || observer.getCurrentQuery().queryHash !== defaultedOptions.queryHash) {
        hasIndexChange = true;
        observer = prevObservers.find(function (x) {
          return x.getCurrentQuery().queryHash === defaultedOptions.queryHash;
        });
      }

      if (observer) {
        observer.setOptions(defaultedOptions);
        return observer;
      }

      return new _this3.Observer(_this3.client, defaultedOptions);
    });

    if (prevObservers.length === newObservers.length && !hasIndexChange) {
      return;
    }

    this.observers = newObservers;
    this.result = newObservers.map(function (observer) {
      return observer.getCurrentResult();
    });

    if (!this.listeners.length) {
      return;
    }

    (0, _utils.difference)(prevObservers, newObservers).forEach(function (observer) {
      observer.destroy();
    });
    (0, _utils.difference)(newObservers, prevObservers).forEach(function (observer) {
      observer.subscribe(function (result) {
        _this3.onUpdate(observer, result);
      });
    });
    this.notify();
  };

  _proto.onUpdate = function onUpdate(observer, result) {
    var index = this.observers.indexOf(observer);

    if (index !== -1) {
      this.result = (0, _utils.replaceAt)(this.result, index, result);
      this.notify();
    }
  };

  _proto.notify = function notify() {
    var _this4 = this;

    _notifyManager.notifyManager.batch(function () {
      _this4.listeners.forEach(function (listener) {
        listener(_this4.result);
      });
    });
  };

  return QueriesObserver;
}(_subscribable.Subscribable);

exports.QueriesObserver = QueriesObserver;