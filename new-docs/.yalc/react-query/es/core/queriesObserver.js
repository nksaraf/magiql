import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { difference, getQueryKeyHashFn, replaceAt } from './utils';
import { notifyManager } from './notifyManager';
import { QueryObserver } from './queryObserver';
import { Subscribable } from './subscribable';
export var QueriesObserver = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(QueriesObserver, _Subscribable);

  function QueriesObserver(client, queries, Observer) {
    var _this;

    if (Observer === void 0) {
      Observer = QueryObserver;
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

      var hashFn = getQueryKeyHashFn(defaultedOptions);
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

    difference(prevObservers, newObservers).forEach(function (observer) {
      observer.destroy();
    });
    difference(newObservers, prevObservers).forEach(function (observer) {
      observer.subscribe(function (result) {
        _this3.onUpdate(observer, result);
      });
    });
    this.notify();
  };

  _proto.onUpdate = function onUpdate(observer, result) {
    var index = this.observers.indexOf(observer);

    if (index !== -1) {
      this.result = replaceAt(this.result, index, result);
      this.notify();
    }
  };

  _proto.notify = function notify() {
    var _this4 = this;

    notifyManager.batch(function () {
      _this4.listeners.forEach(function (listener) {
        listener(_this4.result);
      });
    });
  };

  return QueriesObserver;
}(Subscribable);