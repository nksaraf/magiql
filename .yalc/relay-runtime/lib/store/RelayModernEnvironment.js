/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @emails oncall+relay
 * @format
 */
// flowlint ambiguous-object-type:error
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');

var RelayFeatureFlags = require('../util/RelayFeatureFlags');

var RelayModernQueryExecutor = require('./RelayModernQueryExecutor');

var RelayObservable = require('../network/RelayObservable');

var RelayOperationTracker = require('../store/RelayOperationTracker');

var RelayPublishQueue = require('./RelayPublishQueue');

var RelayRecordSource = require('./RelayRecordSource');

var defaultGetDataID = require('./defaultGetDataID');

var generateID = require('../util/generateID');

var invariant = require("fbjs/lib/invariant");

var RelayModernEnvironment = /*#__PURE__*/function () {
  function RelayModernEnvironment(config) {
    var _this = this;

    var _config$log, _config$UNSTABLE_defa, _config$UNSTABLE_DO_N, _config$scheduler, _config$isServer, _config$operationTrac;

    this.configName = config.configName;
    var handlerProvider = config.handlerProvider ? config.handlerProvider : RelayDefaultHandlerProvider;
    this._treatMissingFieldsAsNull = config.treatMissingFieldsAsNull === true;
    var operationLoader = config.operationLoader;
    var reactFlightPayloadDeserializer = config.reactFlightPayloadDeserializer;

    if (process.env.NODE_ENV !== "production") {
      if (operationLoader != null) {
        !(typeof operationLoader === 'object' && typeof operationLoader.get === 'function' && typeof operationLoader.load === 'function') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected `operationLoader` to be an object ' + 'with get() and load() functions, got `%s`.', operationLoader) : invariant(false) : void 0;
      }

      if (reactFlightPayloadDeserializer != null) {
        !(typeof reactFlightPayloadDeserializer === 'function') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected `reactFlightPayloadDeserializer` ' + ' to be a function, got `%s`.', reactFlightPayloadDeserializer) : invariant(false) : void 0;
      }
    }

    this.__log = (_config$log = config.log) !== null && _config$log !== void 0 ? _config$log : emptyFunction;
    this._defaultRenderPolicy = ((_config$UNSTABLE_defa = config.UNSTABLE_defaultRenderPolicy) !== null && _config$UNSTABLE_defa !== void 0 ? _config$UNSTABLE_defa : RelayFeatureFlags.ENABLE_PARTIAL_RENDERING_DEFAULT === true) ? 'partial' : 'full';
    this._operationLoader = operationLoader;
    this._operationExecutions = new Map();
    this._network = config.network;
    this._getDataID = (_config$UNSTABLE_DO_N = config.UNSTABLE_DO_NOT_USE_getDataID) !== null && _config$UNSTABLE_DO_N !== void 0 ? _config$UNSTABLE_DO_N : defaultGetDataID;
    this._publishQueue = new RelayPublishQueue(config.store, handlerProvider, this._getDataID);
    this._scheduler = (_config$scheduler = config.scheduler) !== null && _config$scheduler !== void 0 ? _config$scheduler : null;
    this._store = config.store;
    this.options = config.options;
    this._isServer = (_config$isServer = config.isServer) !== null && _config$isServer !== void 0 ? _config$isServer : false;

    this.__setNet = function (newNet) {
      return _this._network = newNet;
    };

    if (process.env.NODE_ENV !== "production") {
      var _require = require('./StoreInspector'),
          inspect = _require.inspect;

      this.DEBUG_inspect = function (dataID) {
        return inspect(_this, dataID);
      };
    } // Register this Relay Environment with Relay DevTools if it exists.
    // Note: this must always be the last step in the constructor.


    var _global = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : undefined;

    var devToolsHook = _global && _global.__RELAY_DEVTOOLS_HOOK__;

    if (devToolsHook) {
      devToolsHook.registerEnvironment(this);
    }

    this._missingFieldHandlers = config.missingFieldHandlers;
    this._operationTracker = (_config$operationTrac = config.operationTracker) !== null && _config$operationTrac !== void 0 ? _config$operationTrac : new RelayOperationTracker();
    this._reactFlightPayloadDeserializer = reactFlightPayloadDeserializer;
  }

  var _proto = RelayModernEnvironment.prototype;

  _proto.getStore = function getStore() {
    return this._store;
  };

  _proto.getNetwork = function getNetwork() {
    return this._network;
  };

  _proto.getOperationTracker = function getOperationTracker() {
    return this._operationTracker;
  };

  _proto.isRequestActive = function isRequestActive(requestIdentifier) {
    var activeState = this._operationExecutions.get(requestIdentifier);

    return activeState === 'active';
  };

  _proto.UNSTABLE_getDefaultRenderPolicy = function UNSTABLE_getDefaultRenderPolicy() {
    return this._defaultRenderPolicy;
  };

  _proto.applyUpdate = function applyUpdate(optimisticUpdate) {
    var _this2 = this;

    var dispose = function dispose() {
      _this2._scheduleUpdates(function () {
        _this2._publishQueue.revertUpdate(optimisticUpdate);

        _this2._publishQueue.run();
      });
    };

    this._scheduleUpdates(function () {
      _this2._publishQueue.applyUpdate(optimisticUpdate);

      _this2._publishQueue.run();
    });

    return {
      dispose: dispose
    };
  };

  _proto.revertUpdate = function revertUpdate(update) {
    var _this3 = this;

    this._scheduleUpdates(function () {
      _this3._publishQueue.revertUpdate(update);

      _this3._publishQueue.run();
    });
  };

  _proto.replaceUpdate = function replaceUpdate(update, newUpdate) {
    var _this4 = this;

    this._scheduleUpdates(function () {
      _this4._publishQueue.revertUpdate(update);

      _this4._publishQueue.applyUpdate(newUpdate);

      _this4._publishQueue.run();
    });
  };

  _proto.applyMutation = function applyMutation(optimisticConfig) {
    var _this5 = this;

    var subscription = RelayObservable.create(function (sink) {
      var source = RelayObservable.create(function (_sink) {});
      var executor = RelayModernQueryExecutor.execute({
        operation: optimisticConfig.operation,
        operationExecutions: _this5._operationExecutions,
        operationLoader: _this5._operationLoader,
        optimisticConfig: optimisticConfig,
        publishQueue: _this5._publishQueue,
        reactFlightPayloadDeserializer: _this5._reactFlightPayloadDeserializer,
        scheduler: _this5._scheduler,
        sink: sink,
        source: source,
        store: _this5._store,
        updater: null,
        operationTracker: _this5._operationTracker,
        getDataID: _this5._getDataID,
        treatMissingFieldsAsNull: _this5._treatMissingFieldsAsNull
      });
      return function () {
        return executor.cancel();
      };
    }).subscribe({});
    return {
      dispose: function dispose() {
        return subscription.unsubscribe();
      }
    };
  };

  _proto.check = function check(operation) {
    if (this._missingFieldHandlers == null || this._missingFieldHandlers.length === 0) {
      return this._store.check(operation);
    }

    return this._checkSelectorAndHandleMissingFields(operation, this._missingFieldHandlers);
  };

  _proto.commitPayload = function commitPayload(operation, payload) {
    var _this6 = this;

    RelayObservable.create(function (sink) {
      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationExecutions: _this6._operationExecutions,
        operationLoader: _this6._operationLoader,
        optimisticConfig: null,
        publishQueue: _this6._publishQueue,
        reactFlightPayloadDeserializer: _this6._reactFlightPayloadDeserializer,
        scheduler: _this6._scheduler,
        sink: sink,
        source: RelayObservable.from({
          data: payload
        }),
        store: _this6._store,
        updater: null,
        operationTracker: _this6._operationTracker,
        getDataID: _this6._getDataID,
        isClientPayload: true,
        treatMissingFieldsAsNull: _this6._treatMissingFieldsAsNull
      });
      return function () {
        return executor.cancel();
      };
    }).subscribe({});
  };

  _proto.commitUpdate = function commitUpdate(updater) {
    var _this7 = this;

    this._scheduleUpdates(function () {
      _this7._publishQueue.commitUpdate(updater);

      _this7._publishQueue.run();
    });
  };

  _proto.lookup = function lookup(readSelector) {
    return this._store.lookup(readSelector);
  };

  _proto.subscribe = function subscribe(snapshot, callback) {
    return this._store.subscribe(snapshot, callback);
  };

  _proto.retain = function retain(operation) {
    return this._store.retain(operation);
  };

  _proto.isServer = function isServer() {
    return this._isServer;
  };

  _proto._checkSelectorAndHandleMissingFields = function _checkSelectorAndHandleMissingFields(operation, handlers) {
    var _this8 = this;

    var target = RelayRecordSource.create();

    var result = this._store.check(operation, {
      target: target,
      handlers: handlers
    });

    if (target.size() > 0) {
      this._scheduleUpdates(function () {
        _this8._publishQueue.commitSource(target);

        _this8._publishQueue.run();
      });
    }

    return result;
  };

  _proto._scheduleUpdates = function _scheduleUpdates(task) {
    var scheduler = this._scheduler;

    if (scheduler != null) {
      scheduler.schedule(task);
    } else {
      task();
    }
  }
  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation, each result of which is then
   * normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  ;

  _proto.execute = function execute(_ref) {
    var _this9 = this;

    var operation = _ref.operation,
        cacheConfig = _ref.cacheConfig,
        updater = _ref.updater;

    var _this$__createLogObse = this.__createLogObserver(operation.request.node.params, operation.request.variables),
        logObserver = _this$__createLogObse[0],
        logRequestInfo = _this$__createLogObse[1];

    return RelayObservable.create(function (sink) {
      var source = _this9._network.execute(operation.request.node.params, operation.request.variables, cacheConfig || {}, null, logRequestInfo)["do"](logObserver);

      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationExecutions: _this9._operationExecutions,
        operationLoader: _this9._operationLoader,
        optimisticConfig: null,
        publishQueue: _this9._publishQueue,
        reactFlightPayloadDeserializer: _this9._reactFlightPayloadDeserializer,
        scheduler: _this9._scheduler,
        sink: sink,
        source: source,
        store: _this9._store,
        updater: updater,
        operationTracker: _this9._operationTracker,
        getDataID: _this9._getDataID,
        treatMissingFieldsAsNull: _this9._treatMissingFieldsAsNull
      });
      return function () {
        return executor.cancel();
      };
    });
  }
  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Mutation operation, the result of which is then normalized and
   * committed to the publish queue along with an optional optimistic response
   * or updater.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeMutation({...}).subscribe({...}).
   */
  ;

  _proto.executeMutation = function executeMutation(_ref2) {
    var _this10 = this;

    var cacheConfig = _ref2.cacheConfig,
        operation = _ref2.operation,
        optimisticResponse = _ref2.optimisticResponse,
        optimisticUpdater = _ref2.optimisticUpdater,
        updater = _ref2.updater,
        uploadables = _ref2.uploadables;

    var _this$__createLogObse2 = this.__createLogObserver(operation.request.node.params, operation.request.variables),
        logObserver = _this$__createLogObse2[0],
        logRequestInfo = _this$__createLogObse2[1];

    return RelayObservable.create(function (sink) {
      var optimisticConfig;

      if (optimisticResponse || optimisticUpdater) {
        optimisticConfig = {
          operation: operation,
          response: optimisticResponse,
          updater: optimisticUpdater
        };
      }

      var source = _this10._network.execute(operation.request.node.params, operation.request.variables, _objectSpread({}, cacheConfig, {
        force: true
      }), uploadables, logRequestInfo)["do"](logObserver);

      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationExecutions: _this10._operationExecutions,
        operationLoader: _this10._operationLoader,
        optimisticConfig: optimisticConfig,
        publishQueue: _this10._publishQueue,
        reactFlightPayloadDeserializer: _this10._reactFlightPayloadDeserializer,
        scheduler: _this10._scheduler,
        sink: sink,
        source: source,
        store: _this10._store,
        updater: updater,
        operationTracker: _this10._operationTracker,
        getDataID: _this10._getDataID,
        treatMissingFieldsAsNull: _this10._treatMissingFieldsAsNull
      });
      return function () {
        return executor.cancel();
      };
    });
  }
  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation responses, the result of which is
   * then normalized and comitted to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeWithSource({...}).subscribe({...}).
   */
  ;

  _proto.executeWithSource = function executeWithSource(_ref3) {
    var _this11 = this;

    var operation = _ref3.operation,
        source = _ref3.source;
    return RelayObservable.create(function (sink) {
      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationExecutions: _this11._operationExecutions,
        operationLoader: _this11._operationLoader,
        operationTracker: _this11._operationTracker,
        optimisticConfig: null,
        publishQueue: _this11._publishQueue,
        reactFlightPayloadDeserializer: _this11._reactFlightPayloadDeserializer,
        scheduler: _this11._scheduler,
        sink: sink,
        source: source,
        store: _this11._store,
        getDataID: _this11._getDataID,
        treatMissingFieldsAsNull: _this11._treatMissingFieldsAsNull
      });
      return function () {
        return executor.cancel();
      };
    });
  };

  _proto.toJSON = function toJSON() {
    var _this$configName;

    return "RelayModernEnvironment(".concat((_this$configName = this.configName) !== null && _this$configName !== void 0 ? _this$configName : '', ")");
  };

  _proto.__createLogObserver = function __createLogObserver(params, variables) {
    var transactionID = generateID();
    var log = this.__log;
    var logObserver = {
      start: function start(subscription) {
        log({
          name: 'execute.start',
          transactionID: transactionID,
          params: params,
          variables: variables
        });
      },
      next: function next(response) {
        log({
          name: 'execute.next',
          transactionID: transactionID,
          response: response
        });
      },
      error: function error(_error) {
        log({
          name: 'execute.error',
          transactionID: transactionID,
          error: _error
        });
      },
      complete: function complete() {
        log({
          name: 'execute.complete',
          transactionID: transactionID
        });
      },
      unsubscribe: function unsubscribe() {
        log({
          name: 'execute.unsubscribe',
          transactionID: transactionID
        });
      }
    };

    var logRequestInfo = function logRequestInfo(info) {
      log({
        name: 'execute.info',
        transactionID: transactionID,
        info: info
      });
    };

    return [logObserver, logRequestInfo];
  };

  return RelayModernEnvironment;
}(); // Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.


RelayModernEnvironment.prototype['@@RelayModernEnvironment'] = true;

function emptyFunction() {}

module.exports = RelayModernEnvironment;