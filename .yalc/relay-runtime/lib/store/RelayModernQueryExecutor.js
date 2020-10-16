/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+relay
 */
// flowlint ambiguous-object-type:error
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var RelayError = require('../util/RelayError');

var RelayModernRecord = require('./RelayModernRecord');

var RelayObservable = require('../network/RelayObservable');

var RelayRecordSource = require('./RelayRecordSource');

var RelayResponseNormalizer = require('./RelayResponseNormalizer');

var getOperation = require('../util/getOperation');

var invariant = require("fbjs/lib/invariant");

var stableCopy = require('../util/stableCopy');

var warning = require("fbjs/lib/warning");

var _require = require('./ClientID'),
    generateClientID = _require.generateClientID;

var _require2 = require('./RelayModernSelector'),
    createNormalizationSelector = _require2.createNormalizationSelector;

var _require3 = require('./RelayStoreUtils'),
    ROOT_TYPE = _require3.ROOT_TYPE,
    TYPENAME_KEY = _require3.TYPENAME_KEY,
    getStorageKey = _require3.getStorageKey;

function execute(config) {
  return new Executor(config);
}
/**
 * Coordinates the execution of a query, handling network callbacks
 * including optimistic payloads, standard payloads, resolution of match
 * dependencies, etc.
 */


var Executor = /*#__PURE__*/function () {
  function Executor(_ref) {
    var _this = this;

    var operation = _ref.operation,
        operationExecutions = _ref.operationExecutions,
        operationLoader = _ref.operationLoader,
        optimisticConfig = _ref.optimisticConfig,
        publishQueue = _ref.publishQueue,
        scheduler = _ref.scheduler,
        sink = _ref.sink,
        source = _ref.source,
        store = _ref.store,
        updater = _ref.updater,
        operationTracker = _ref.operationTracker,
        treatMissingFieldsAsNull = _ref.treatMissingFieldsAsNull,
        getDataID = _ref.getDataID,
        isClientPayload = _ref.isClientPayload,
        reactFlightPayloadDeserializer = _ref.reactFlightPayloadDeserializer;
    this._getDataID = getDataID;
    this._treatMissingFieldsAsNull = treatMissingFieldsAsNull;
    this._incrementalPayloadsPending = false;
    this._incrementalResults = new Map();
    this._nextSubscriptionId = 0;
    this._operation = operation;
    this._operationExecutions = operationExecutions;
    this._operationLoader = operationLoader;
    this._operationTracker = operationTracker;
    this._operationUpdateEpochs = new Map();
    this._optimisticUpdates = null;
    this._pendingModulePayloadsCount = 0;
    this._publishQueue = publishQueue;
    this._scheduler = scheduler;
    this._sink = sink;
    this._source = new Map();
    this._state = 'started';
    this._store = store;
    this._subscriptions = new Map();
    this._updater = updater;
    this._isClientPayload = isClientPayload === true;
    this._reactFlightPayloadDeserializer = reactFlightPayloadDeserializer;
    var id = this._nextSubscriptionId++;
    source.subscribe({
      complete: function complete() {
        return _this._complete(id);
      },
      error: function error(_error2) {
        return _this._error(_error2);
      },
      next: function next(response) {
        try {
          _this._next(id, response);
        } catch (error) {
          sink.error(error);
        }
      },
      start: function start(subscription) {
        return _this._start(id, subscription);
      }
    });

    if (optimisticConfig != null) {
      this._processOptimisticResponse(optimisticConfig.response != null ? {
        data: optimisticConfig.response
      } : null, optimisticConfig.updater, false);
    }
  } // Cancel any pending execution tasks and mark the executor as completed.


  var _proto = Executor.prototype;

  _proto.cancel = function cancel() {
    var _this2 = this;

    if (this._state === 'completed') {
      return;
    }

    this._state = 'completed';

    this._operationExecutions["delete"](this._operation.request.identifier);

    if (this._subscriptions.size !== 0) {
      this._subscriptions.forEach(function (sub) {
        return sub.unsubscribe();
      });

      this._subscriptions.clear();
    }

    var optimisticUpdates = this._optimisticUpdates;

    if (optimisticUpdates !== null) {
      this._optimisticUpdates = null;
      optimisticUpdates.forEach(function (update) {
        return _this2._publishQueue.revertUpdate(update);
      });

      this._publishQueue.run();
    }

    this._incrementalResults.clear();

    this._completeOperationTracker();

    if (this._retainDisposable) {
      this._retainDisposable.dispose();

      this._retainDisposable = null;
    }
  };

  _proto._updateActiveState = function _updateActiveState() {
    var activeState;

    switch (this._state) {
      case 'started':
        {
          activeState = 'active';
          break;
        }

      case 'loading_incremental':
        {
          activeState = 'active';
          break;
        }

      case 'completed':
        {
          activeState = 'inactive';
          break;
        }

      case 'loading_final':
        {
          activeState = this._pendingModulePayloadsCount > 0 ? 'active' : 'inactive';
          break;
        }

      default:
        this._state;
        !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernQueryExecutor: invalid executor state.') : invariant(false) : void 0;
    }

    this._operationExecutions.set(this._operation.request.identifier, activeState);
  };

  _proto._schedule = function _schedule(task) {
    var _this3 = this;

    var scheduler = this._scheduler;

    if (scheduler != null) {
      var _id2 = this._nextSubscriptionId++;

      RelayObservable.create(function (sink) {
        var cancellationToken = scheduler.schedule(function () {
          try {
            task();
            sink.complete();
          } catch (error) {
            sink.error(error);
          }
        });
        return function () {
          return scheduler.cancel(cancellationToken);
        };
      }).subscribe({
        complete: function complete() {
          return _this3._complete(_id2);
        },
        error: function error(_error3) {
          return _this3._error(_error3);
        },
        start: function start(subscription) {
          return _this3._start(_id2, subscription);
        }
      });
    } else {
      task();
    }
  };

  _proto._complete = function _complete(id) {
    this._subscriptions["delete"](id);

    if (this._subscriptions.size === 0) {
      this.cancel();

      this._sink.complete();
    }
  };

  _proto._error = function _error(error) {
    this.cancel();

    this._sink.error(error);
  };

  _proto._start = function _start(id, subscription) {
    this._subscriptions.set(id, subscription);

    this._updateActiveState();
  } // Handle a raw GraphQL response.
  ;

  _proto._next = function _next(_id, response) {
    var _this4 = this;

    this._schedule(function () {
      _this4._handleNext(response);

      _this4._maybeCompleteSubscriptionOperationTracking();
    });
  };

  _proto._handleErrorResponse = function _handleErrorResponse(responses) {
    var _this5 = this;

    var results = [];
    responses.forEach(function (response) {
      if (response.data === null && response.extensions != null && !response.hasOwnProperty('errors')) {
        // Skip extensions-only payloads
        return;
      } else if (response.data == null) {
        // Error if any other payload in the batch is missing data, regardless of whether
        // it had `errors` or not.
        var errors = response.hasOwnProperty('errors') && response.errors != null ? response.errors : null;
        var messages = errors ? errors.map(function (_ref2) {
          var message = _ref2.message;
          return message;
        }).join('\n') : '(No errors)';
        var error = RelayError.create('RelayNetwork', 'No data returned for operation `' + _this5._operation.request.node.params.name + '`, got error(s):\n' + messages + '\n\nSee the error `source` property for more information.');
        error.source = {
          errors: errors,
          operation: _this5._operation.request.node,
          variables: _this5._operation.request.variables
        }; // In V8, Error objects keep the closure scope chain alive until the
        // err.stack property is accessed.

        error.stack;
        throw error;
      } else {
        var responseWithData = response;
        results.push(responseWithData);
      }
    });
    return results;
  }
  /**
   * This method return boolean to indicate if the optimistic
   * response has been handled
   */
  ;

  _proto._handleOptimisticResponses = function _handleOptimisticResponses(responses) {
    var _response$extensions;

    if (responses.length > 1) {
      if (responses.some(function (responsePart) {
        var _responsePart$extensi;

        return ((_responsePart$extensi = responsePart.extensions) === null || _responsePart$extensi === void 0 ? void 0 : _responsePart$extensi.isOptimistic) === true;
      })) {
        !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Optimistic responses cannot be batched.') : invariant(false) : void 0;
      }

      return false;
    }

    var response = responses[0];
    var isOptimistic = ((_response$extensions = response.extensions) === null || _response$extensions === void 0 ? void 0 : _response$extensions.isOptimistic) === true;

    if (isOptimistic && this._state !== 'started') {
      !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernQueryExecutor: optimistic payload received after server payload.') : invariant(false) : void 0;
    }

    if (isOptimistic) {
      this._processOptimisticResponse(response, null, this._treatMissingFieldsAsNull);

      this._sink.next(response);

      return true;
    }

    return false;
  };

  _proto._handleNext = function _handleNext(response) {
    if (this._state === 'completed') {
      return;
    }

    var responses = Array.isArray(response) ? response : [response];

    var responsesWithData = this._handleErrorResponse(responses);

    if (responsesWithData.length === 0) {
      // no results with data, nothing to process
      // this can occur with extensions-only payloads
      var isFinal = responses.some(function (x) {
        var _x$extensions;

        return ((_x$extensions = x.extensions) === null || _x$extensions === void 0 ? void 0 : _x$extensions.is_final) === true;
      });

      if (isFinal) {
        this._state = 'loading_final';

        this._updateActiveState();

        this._incrementalPayloadsPending = false;
      }

      this._sink.next(response);

      return;
    } // Next, handle optimistic responses


    var isOptimistic = this._handleOptimisticResponses(responsesWithData);

    if (isOptimistic) {
      return;
    }

    var _partitionGraphQLResp = partitionGraphQLResponses(responsesWithData),
        nonIncrementalResponses = _partitionGraphQLResp[0],
        incrementalResponses = _partitionGraphQLResp[1]; // In theory this doesn't preserve the ordering of the batch.
    // The idea is that a batch is always:
    //  * at most one non-incremental payload
    //  * followed by zero or more incremental payloads
    // The non-incremental payload can appear if the server sends a batch
    // with the initial payload followed by some early-to-resolve incremental
    // payloads (although, can that even happen?)


    if (nonIncrementalResponses.length > 0) {
      var payloadFollowups = this._processResponses(nonIncrementalResponses); // Please note that we're passing `this._operation` to the publish
      // queue here, which will later passed to the store (via notify)
      // to indicate that this is an operation that caused the store to update


      var updatedOwners = this._publishQueue.run(this._operation);

      this._updateOperationTracker(updatedOwners);

      this._processPayloadFollowups(payloadFollowups);

      if (this._incrementalPayloadsPending && !this._retainDisposable) {
        this._retainDisposable = this._store.retain(this._operation);
      }
    }

    if (incrementalResponses.length > 0) {
      var _payloadFollowups = this._processIncrementalResponses(incrementalResponses); // For the incremental case, we're only handling follow-up responses
      // for already initiated operation (and we're not passing it to
      // the run(...) call)


      var _updatedOwners = this._publishQueue.run();

      this._updateOperationTracker(_updatedOwners);

      this._processPayloadFollowups(_payloadFollowups);
    }

    this._sink.next(response);
  };

  _proto._processOptimisticResponse = function _processOptimisticResponse(response, updater, treatMissingFieldsAsNull) {
    var _this6 = this;

    !(this._optimisticUpdates === null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'environment.execute: only support one optimistic response per ' + 'execute.') : invariant(false) : void 0;

    if (response == null && updater == null) {
      return;
    }

    var optimisticUpdates = [];

    if (response) {
      var payload = normalizeResponse(response, this._operation.root, ROOT_TYPE, {
        getDataID: this._getDataID,
        path: [],
        reactFlightPayloadDeserializer: this._reactFlightPayloadDeserializer,
        treatMissingFieldsAsNull: treatMissingFieldsAsNull
      });
      validateOptimisticResponsePayload(payload);
      optimisticUpdates.push({
        operation: this._operation,
        payload: payload,
        updater: updater
      });

      this._processOptimisticFollowups(payload, optimisticUpdates);
    } else if (updater) {
      optimisticUpdates.push({
        operation: this._operation,
        payload: {
          errors: null,
          fieldPayloads: null,
          incrementalPlaceholders: null,
          moduleImportPayloads: null,
          source: RelayRecordSource.create(),
          isFinal: false
        },
        updater: updater
      });
    }

    this._optimisticUpdates = optimisticUpdates;
    optimisticUpdates.forEach(function (update) {
      return _this6._publishQueue.applyUpdate(update);
    });

    this._publishQueue.run();
  };

  _proto._processOptimisticFollowups = function _processOptimisticFollowups(payload, optimisticUpdates) {
    if (payload.moduleImportPayloads && payload.moduleImportPayloads.length) {
      var moduleImportPayloads = payload.moduleImportPayloads;
      var operationLoader = this._operationLoader;
      !operationLoader ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected an operationLoader to be ' + 'configured when using `@match`.') : invariant(false) : void 0;

      var _iterator = _createForOfIteratorHelper(moduleImportPayloads),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var moduleImportPayload = _step.value;
          var operation = operationLoader.get(moduleImportPayload.operationReference);

          if (operation == null) {
            this._processAsyncOptimisticModuleImport(operationLoader, moduleImportPayload);
          } else {
            var moduleImportOptimisticUpdates = this._processOptimisticModuleImport(operation, moduleImportPayload);

            optimisticUpdates.push.apply(optimisticUpdates, (0, _toConsumableArray2["default"])(moduleImportOptimisticUpdates));
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  };

  _proto._normalizeModuleImport = function _normalizeModuleImport(moduleImportPayload, operation) {
    var selector = createNormalizationSelector(operation, moduleImportPayload.dataID, moduleImportPayload.variables);
    return normalizeResponse({
      data: moduleImportPayload.data
    }, selector, moduleImportPayload.typeName, {
      getDataID: this._getDataID,
      path: moduleImportPayload.path,
      reactFlightPayloadDeserializer: this._reactFlightPayloadDeserializer,
      treatMissingFieldsAsNull: this._treatMissingFieldsAsNull
    });
  };

  _proto._processOptimisticModuleImport = function _processOptimisticModuleImport(normalizationRootNode, moduleImportPayload) {
    var operation = getOperation(normalizationRootNode);
    var optimisticUpdates = [];

    var modulePayload = this._normalizeModuleImport(moduleImportPayload, operation);

    validateOptimisticResponsePayload(modulePayload);
    optimisticUpdates.push({
      operation: this._operation,
      payload: modulePayload,
      updater: null
    });

    this._processOptimisticFollowups(modulePayload, optimisticUpdates);

    return optimisticUpdates;
  };

  _proto._processAsyncOptimisticModuleImport = function _processAsyncOptimisticModuleImport(operationLoader, moduleImportPayload) {
    var _this7 = this;

    operationLoader.load(moduleImportPayload.operationReference).then(function (operation) {
      if (operation == null || _this7._state !== 'started') {
        return;
      }

      var moduleImportOptimisticUpdates = _this7._processOptimisticModuleImport(operation, moduleImportPayload);

      moduleImportOptimisticUpdates.forEach(function (update) {
        return _this7._publishQueue.applyUpdate(update);
      });

      if (_this7._optimisticUpdates == null) {
        process.env.NODE_ENV !== "production" ? warning(false, 'RelayModernQueryExecutor: Unexpected ModuleImport optimisitc ' + 'update in operation %s.' + _this7._operation.request.node.params.name) : void 0;
      } else {
        var _this$_optimisticUpda;

        (_this$_optimisticUpda = _this7._optimisticUpdates).push.apply(_this$_optimisticUpda, (0, _toConsumableArray2["default"])(moduleImportOptimisticUpdates));

        _this7._publishQueue.run();
      }
    });
  };

  _proto._processResponses = function _processResponses(responses) {
    var _this8 = this;

    if (this._optimisticUpdates !== null) {
      this._optimisticUpdates.forEach(function (update) {
        return _this8._publishQueue.revertUpdate(update);
      });

      this._optimisticUpdates = null;
    }

    this._incrementalPayloadsPending = false;

    this._incrementalResults.clear();

    this._source.clear();

    return responses.map(function (payloadPart) {
      var relayPayload = normalizeResponse(payloadPart, _this8._operation.root, ROOT_TYPE, {
        getDataID: _this8._getDataID,
        path: [],
        reactFlightPayloadDeserializer: _this8._reactFlightPayloadDeserializer,
        treatMissingFieldsAsNull: _this8._treatMissingFieldsAsNull
      });

      _this8._publishQueue.commitPayload(_this8._operation, relayPayload, _this8._updater);

      return relayPayload;
    });
  }
  /**
   * Handles any follow-up actions for a Relay payload for @match, @defer,
   * and @stream directives.
   */
  ;

  _proto._processPayloadFollowups = function _processPayloadFollowups(payloads) {
    var _this9 = this;

    if (this._state === 'completed') {
      return;
    }

    payloads.forEach(function (payload) {
      var incrementalPlaceholders = payload.incrementalPlaceholders,
          moduleImportPayloads = payload.moduleImportPayloads,
          isFinal = payload.isFinal;
      _this9._state = isFinal ? 'loading_final' : 'loading_incremental';

      _this9._updateActiveState();

      if (isFinal) {
        _this9._incrementalPayloadsPending = false;
      }

      if (moduleImportPayloads && moduleImportPayloads.length !== 0) {
        var operationLoader = _this9._operationLoader;
        !operationLoader ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected an operationLoader to be ' + 'configured when using `@match`.') : invariant(false) : void 0;
        moduleImportPayloads.forEach(function (moduleImportPayload) {
          _this9._processModuleImportPayload(moduleImportPayload, operationLoader);
        });
      }

      if (incrementalPlaceholders && incrementalPlaceholders.length !== 0) {
        _this9._incrementalPayloadsPending = _this9._state !== 'loading_final';
        incrementalPlaceholders.forEach(function (incrementalPlaceholder) {
          _this9._processIncrementalPlaceholder(payload, incrementalPlaceholder);
        });

        if (_this9._isClientPayload || _this9._state === 'loading_final') {
          // The query has defer/stream selections that are enabled, but either
          // the server indicated that this is a "final" payload: no incremental
          // payloads will be delivered, then warn that the query was (likely)
          // executed on the server in non-streaming mode, with incremental
          // delivery disabled; or this is a client payload, and there will be
          // no incremental payload.
          process.env.NODE_ENV !== "production" ? warning(_this9._isClientPayload, 'RelayModernEnvironment: Operation `%s` contains @defer/@stream ' + 'directives but was executed in non-streaming mode. See ' + 'https://fburl.com/relay-incremental-delivery-non-streaming-warning.', _this9._operation.request.node.params.name) : void 0; // But eagerly process any deferred payloads

          var relayPayloads = [];
          incrementalPlaceholders.forEach(function (placeholder) {
            if (placeholder.kind === 'defer') {
              relayPayloads.push(_this9._processDeferResponse(placeholder.label, placeholder.path, placeholder, {
                data: placeholder.data
              }));
            }
          });

          if (relayPayloads.length > 0) {
            var updatedOwners = _this9._publishQueue.run();

            _this9._updateOperationTracker(updatedOwners);

            _this9._processPayloadFollowups(relayPayloads);
          }
        }
      }
    });
  };

  _proto._maybeCompleteSubscriptionOperationTracking = function _maybeCompleteSubscriptionOperationTracking() {
    var isSubscriptionOperation = this._operation.request.node.params.operationKind === 'subscription';

    if (!isSubscriptionOperation) {
      return;
    }

    if (this._pendingModulePayloadsCount === 0 && this._incrementalPayloadsPending === false) {
      this._completeOperationTracker();
    }
  }
  /**
   * Processes a ModuleImportPayload, asynchronously resolving the normalization
   * AST and using it to normalize the field data into a RelayResponsePayload.
   * The resulting payload may contain other incremental payloads (match,
   * defer, stream, etc); these are handled by calling
   * `_processPayloadFollowups()`.
   */
  ;

  _proto._processModuleImportPayload = function _processModuleImportPayload(moduleImportPayload, operationLoader) {
    var _this10 = this;

    var node = operationLoader.get(moduleImportPayload.operationReference);

    if (node != null) {
      var operation = getOperation(node); // If the operation module is available synchronously, normalize the
      // data synchronously.

      this._handleModuleImportPayload(moduleImportPayload, operation);

      this._maybeCompleteSubscriptionOperationTracking();
    } else {
      // Otherwise load the operation module and schedule a task to normalize
      // the data when the module is available.
      var _id3 = this._nextSubscriptionId++;

      this._pendingModulePayloadsCount++;

      var decrementPendingCount = function decrementPendingCount() {
        _this10._pendingModulePayloadsCount--;

        _this10._maybeCompleteSubscriptionOperationTracking();
      }; // Observable.from(operationLoader.load()) wouldn't catch synchronous
      // errors thrown by the load function, which is user-defined. Guard
      // against that with Observable.from(new Promise(<work>)).


      RelayObservable.from(new Promise(function (resolve, reject) {
        operationLoader.load(moduleImportPayload.operationReference).then(resolve, reject);
      })).map(function (operation) {
        if (operation != null) {
          _this10._schedule(function () {
            _this10._handleModuleImportPayload(moduleImportPayload, getOperation(operation));
          });
        }
      }).subscribe({
        complete: function complete() {
          _this10._complete(_id3);

          decrementPendingCount();
        },
        error: function error(_error4) {
          _this10._error(_error4);

          decrementPendingCount();
        },
        start: function start(subscription) {
          return _this10._start(_id3, subscription);
        }
      });
    }
  };

  _proto._handleModuleImportPayload = function _handleModuleImportPayload(moduleImportPayload, operation) {
    var relayPayload = this._normalizeModuleImport(moduleImportPayload, operation);

    this._publishQueue.commitPayload(this._operation, relayPayload);

    var updatedOwners = this._publishQueue.run();

    this._updateOperationTracker(updatedOwners);

    this._processPayloadFollowups([relayPayload]);
  }
  /**
   * The executor now knows that GraphQL responses are expected for a given
   * label/path:
   * - Store the placeholder in order to process any future responses that may
   *   arrive.
   * - Then process any responses that had already arrived.
   *
   * The placeholder contains the normalization selector, path (for nested
   * defer/stream), and other metadata used to normalize the incremental
   * response(s).
   */
  ;

  _proto._processIncrementalPlaceholder = function _processIncrementalPlaceholder(relayPayload, placeholder) {
    var _relayPayload$fieldPa;

    // Update the label => path => placeholder map
    var label = placeholder.label,
        path = placeholder.path;
    var pathKey = path.map(String).join('.');

    var resultForLabel = this._incrementalResults.get(label);

    if (resultForLabel == null) {
      resultForLabel = new Map();

      this._incrementalResults.set(label, resultForLabel);
    }

    var resultForPath = resultForLabel.get(pathKey);
    var pendingResponses = resultForPath != null && resultForPath.kind === 'response' ? resultForPath.responses : null;
    resultForLabel.set(pathKey, {
      kind: 'placeholder',
      placeholder: placeholder
    }); // Store references to the parent node to allow detecting concurrent
    // modifications to the parent before items arrive and to replay
    // handle field payloads to account for new information on source records.

    var parentID;

    if (placeholder.kind === 'stream') {
      parentID = placeholder.parentID;
    } else if (placeholder.kind === 'defer') {
      parentID = placeholder.selector.dataID;
    } else {
      placeholder;
      !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Unsupported incremental placeholder kind `%s`.', placeholder.kind) : invariant(false) : void 0;
    }

    var parentRecord = relayPayload.source.get(parentID);
    var parentPayloads = ((_relayPayload$fieldPa = relayPayload.fieldPayloads) !== null && _relayPayload$fieldPa !== void 0 ? _relayPayload$fieldPa : []).filter(function (fieldPayload) {
      var fieldID = generateClientID(fieldPayload.dataID, fieldPayload.fieldKey);
      return (// handlers applied to the streamed field itself
        fieldPayload.dataID === parentID || // handlers applied to a field on an ancestor object, where
        // ancestor.field links to the parent record (example: connections)
        fieldID === parentID
      );
    }); // If an incremental payload exists for some id that record should also
    // exist.

    !(parentRecord != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected record `%s` to exist.', parentID) : invariant(false) : void 0;
    var nextParentRecord;
    var nextParentPayloads;

    var previousParentEntry = this._source.get(parentID);

    if (previousParentEntry != null) {
      // If a previous entry exists, merge the previous/next records and
      // payloads together.
      nextParentRecord = RelayModernRecord.update(previousParentEntry.record, parentRecord);
      var handlePayloads = new Map();

      var dedupePayload = function dedupePayload(payload) {
        var key = stableStringify(payload);
        handlePayloads.set(key, payload);
      };

      previousParentEntry.fieldPayloads.forEach(dedupePayload);
      parentPayloads.forEach(dedupePayload);
      nextParentPayloads = Array.from(handlePayloads.values());
    } else {
      nextParentRecord = parentRecord;
      nextParentPayloads = parentPayloads;
    }

    this._source.set(parentID, {
      record: nextParentRecord,
      fieldPayloads: nextParentPayloads
    }); // If there were any queued responses, process them now that placeholders
    // are in place


    if (pendingResponses != null) {
      var payloadFollowups = this._processIncrementalResponses(pendingResponses);

      var updatedOwners = this._publishQueue.run();

      this._updateOperationTracker(updatedOwners);

      this._processPayloadFollowups(payloadFollowups);
    }
  }
  /**
   * Lookup the placeholder the describes how to process an incremental
   * response, normalize/publish it, and process any nested defer/match/stream
   * metadata.
   */
  ;

  _proto._processIncrementalResponses = function _processIncrementalResponses(incrementalResponses) {
    var _this11 = this;

    var relayPayloads = [];
    incrementalResponses.forEach(function (incrementalResponse) {
      var label = incrementalResponse.label,
          path = incrementalResponse.path,
          response = incrementalResponse.response;

      var resultForLabel = _this11._incrementalResults.get(label);

      if (resultForLabel == null) {
        resultForLabel = new Map();

        _this11._incrementalResults.set(label, resultForLabel);
      }

      if (label.indexOf('$defer$') !== -1) {
        var pathKey = path.map(String).join('.');
        var resultForPath = resultForLabel.get(pathKey);

        if (resultForPath == null) {
          resultForPath = {
            kind: 'response',
            responses: [incrementalResponse]
          };
          resultForLabel.set(pathKey, resultForPath);
          return;
        } else if (resultForPath.kind === 'response') {
          resultForPath.responses.push(incrementalResponse);
          return;
        }

        var placeholder = resultForPath.placeholder;
        !(placeholder.kind === 'defer') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected data for path `%s` for label `%s` ' + 'to be data for @defer, was `@%s`.', pathKey, label, placeholder.kind) : invariant(false) : void 0;
        relayPayloads.push(_this11._processDeferResponse(label, path, placeholder, response));
      } else {
        // @stream payload path values end in the field name and item index,
        // but Relay records paths relative to the parent of the stream node:
        // therefore we strip the last two elements just to lookup the path
        // (the item index is used later to insert the element in the list)
        var _pathKey = path.slice(0, -2).map(String).join('.');

        var _resultForPath = resultForLabel.get(_pathKey);

        if (_resultForPath == null) {
          _resultForPath = {
            kind: 'response',
            responses: [incrementalResponse]
          };
          resultForLabel.set(_pathKey, _resultForPath);
          return;
        } else if (_resultForPath.kind === 'response') {
          _resultForPath.responses.push(incrementalResponse);

          return;
        }

        var _placeholder = _resultForPath.placeholder;
        !(_placeholder.kind === 'stream') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected data for path `%s` for label `%s` ' + 'to be data for @stream, was `@%s`.', _pathKey, label, _placeholder.kind) : invariant(false) : void 0;
        relayPayloads.push(_this11._processStreamResponse(label, path, _placeholder, response));
      }
    });
    return relayPayloads;
  };

  _proto._processDeferResponse = function _processDeferResponse(label, path, placeholder, response) {
    var parentID = placeholder.selector.dataID;
    var relayPayload = normalizeResponse(response, placeholder.selector, placeholder.typeName, {
      getDataID: this._getDataID,
      path: placeholder.path,
      reactFlightPayloadDeserializer: this._reactFlightPayloadDeserializer,
      treatMissingFieldsAsNull: this._treatMissingFieldsAsNull
    });

    this._publishQueue.commitPayload(this._operation, relayPayload); // Load the version of the parent record from which this incremental data
    // was derived


    var parentEntry = this._source.get(parentID);

    !(parentEntry != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected the parent record `%s` for @defer ' + 'data to exist.', parentID) : invariant(false) : void 0;
    var fieldPayloads = parentEntry.fieldPayloads;

    if (fieldPayloads.length !== 0) {
      var _response$extensions2;

      var handleFieldsRelayPayload = {
        errors: null,
        fieldPayloads: fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: RelayRecordSource.create(),
        isFinal: ((_response$extensions2 = response.extensions) === null || _response$extensions2 === void 0 ? void 0 : _response$extensions2.is_final) === true
      };

      this._publishQueue.commitPayload(this._operation, handleFieldsRelayPayload);
    }

    return relayPayload;
  }
  /**
   * Process the data for one item in a @stream field.
   */
  ;

  _proto._processStreamResponse = function _processStreamResponse(label, path, placeholder, response) {
    var parentID = placeholder.parentID,
        node = placeholder.node,
        variables = placeholder.variables; // Find the LinkedField where @stream was applied

    var field = node.selections[0];
    !(field != null && field.kind === 'LinkedField' && field.plural === true) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected @stream to be used on a plural field.') : invariant(false) : void 0;

    var _this$_normalizeStrea = this._normalizeStreamItem(response, parentID, field, variables, path, placeholder.path),
        fieldPayloads = _this$_normalizeStrea.fieldPayloads,
        itemID = _this$_normalizeStrea.itemID,
        itemIndex = _this$_normalizeStrea.itemIndex,
        prevIDs = _this$_normalizeStrea.prevIDs,
        relayPayload = _this$_normalizeStrea.relayPayload,
        storageKey = _this$_normalizeStrea.storageKey; // Publish the new item and update the parent record to set
    // field[index] = item *if* the parent record hasn't been concurrently
    // modified.


    this._publishQueue.commitPayload(this._operation, relayPayload, function (store) {
      var currentParentRecord = store.get(parentID);

      if (currentParentRecord == null) {
        // parent has since been deleted, stream data is stale
        return;
      }

      var currentItems = currentParentRecord.getLinkedRecords(storageKey);

      if (currentItems == null) {
        // field has since been deleted, stream data is stale
        return;
      }

      if (currentItems.length !== prevIDs.length || currentItems.some(function (currentItem, index) {
        return prevIDs[index] !== (currentItem && currentItem.getDataID());
      })) {
        // field has been modified by something other than this query,
        // stream data is stale
        return;
      } // parent.field has not been concurrently modified:
      // update `parent.field[index] = item`


      var nextItems = (0, _toConsumableArray2["default"])(currentItems);
      nextItems[itemIndex] = store.get(itemID);
      currentParentRecord.setLinkedRecords(nextItems, storageKey);
    }); // Now that the parent record has been updated to include the new item,
    // also update any handle fields that are derived from the parent record.


    if (fieldPayloads.length !== 0) {
      var handleFieldsRelayPayload = {
        errors: null,
        fieldPayloads: fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: RelayRecordSource.create(),
        isFinal: false
      };

      this._publishQueue.commitPayload(this._operation, handleFieldsRelayPayload);
    }

    return relayPayload;
  };

  _proto._normalizeStreamItem = function _normalizeStreamItem(response, parentID, field, variables, path, normalizationPath) {
    var _field$alias, _field$concreteType, _this$_getDataID;

    var data = response.data;
    !(typeof data === 'object') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected the GraphQL @stream payload `data` ' + 'value to be an object.') : invariant(false) : void 0;
    var responseKey = (_field$alias = field.alias) !== null && _field$alias !== void 0 ? _field$alias : field.name;
    var storageKey = getStorageKey(field, variables); // Load the version of the parent record from which this incremental data
    // was derived

    var parentEntry = this._source.get(parentID);

    !(parentEntry != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected the parent record `%s` for @stream ' + 'data to exist.', parentID) : invariant(false) : void 0;
    var parentRecord = parentEntry.record,
        fieldPayloads = parentEntry.fieldPayloads; // Load the field value (items) that were created by *this* query executor
    // in order to check if there has been any concurrent modifications by some
    // other operation.

    var prevIDs = RelayModernRecord.getLinkedRecordIDs(parentRecord, storageKey);
    !(prevIDs != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected record `%s` to have fetched field ' + '`%s` with @stream.', parentID, field.name) : invariant(false) : void 0; // Determine the index in the field of the new item

    var finalPathEntry = path[path.length - 1];
    var itemIndex = parseInt(finalPathEntry, 10);
    !(itemIndex === finalPathEntry && itemIndex >= 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected path for @stream to end in a ' + 'positive integer index, got `%s`', finalPathEntry) : invariant(false) : void 0;
    var typeName = (_field$concreteType = field.concreteType) !== null && _field$concreteType !== void 0 ? _field$concreteType : data[TYPENAME_KEY];
    !(typeof typeName === 'string') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected @stream field `%s` to have a ' + '__typename.', field.name) : invariant(false) : void 0; // Determine the __id of the new item: this must equal the value that would
    // be assigned had the item not been streamed

    var itemID = // https://github.com/prettier/prettier/issues/6403
    // prettier-ignore
    ((_this$_getDataID = this._getDataID(data, typeName)) !== null && _this$_getDataID !== void 0 ? _this$_getDataID : prevIDs && prevIDs[itemIndex]) || // Reuse previously generated client IDs
    generateClientID(parentID, storageKey, itemIndex);
    !(typeof itemID === 'string') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected id of elements of field `%s` to ' + 'be strings.', storageKey) : invariant(false) : void 0; // Build a selector to normalize the item data with

    var selector = createNormalizationSelector(field, itemID, variables); // Update the cached version of the parent record to reflect the new item:
    // this is used when subsequent stream payloads arrive to see if there
    // have been concurrent modifications to the list

    var nextParentRecord = RelayModernRecord.clone(parentRecord);
    var nextIDs = (0, _toConsumableArray2["default"])(prevIDs);
    nextIDs[itemIndex] = itemID;
    RelayModernRecord.setLinkedRecordIDs(nextParentRecord, storageKey, nextIDs);

    this._source.set(parentID, {
      record: nextParentRecord,
      fieldPayloads: fieldPayloads
    });

    var relayPayload = normalizeResponse(response, selector, typeName, {
      getDataID: this._getDataID,
      path: [].concat((0, _toConsumableArray2["default"])(normalizationPath), [responseKey, String(itemIndex)]),
      reactFlightPayloadDeserializer: this._reactFlightPayloadDeserializer,
      treatMissingFieldsAsNull: this._treatMissingFieldsAsNull
    });
    return {
      fieldPayloads: fieldPayloads,
      itemID: itemID,
      itemIndex: itemIndex,
      prevIDs: prevIDs,
      relayPayload: relayPayload,
      storageKey: storageKey
    };
  };

  _proto._updateOperationTracker = function _updateOperationTracker(updatedOwners) {
    if (this._operationTracker != null && updatedOwners != null && updatedOwners.length > 0) {
      this._operationTracker.update(this._operation.request, new Set(updatedOwners));
    }
  };

  _proto._completeOperationTracker = function _completeOperationTracker() {
    if (this._operationTracker != null) {
      this._operationTracker.complete(this._operation.request);
    }
  };

  return Executor;
}();

function partitionGraphQLResponses(responses) {
  var nonIncrementalResponses = [];
  var incrementalResponses = [];
  responses.forEach(function (response) {
    if (response.path != null || response.label != null) {
      var label = response.label,
          path = response.path;

      if (label == null || path == null) {
        !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernQueryExecutor: invalid incremental payload, expected ' + '`path` and `label` to either both be null/undefined, or ' + '`path` to be an `Array<string | number>` and `label` to be a ' + '`string`.') : invariant(false) : void 0;
      }

      incrementalResponses.push({
        label: label,
        path: path,
        response: response
      });
    } else {
      nonIncrementalResponses.push(response);
    }
  });
  return [nonIncrementalResponses, incrementalResponses];
}

function normalizeResponse(response, selector, typeName, options) {
  var _response$extensions3;

  var data = response.data,
      errors = response.errors;
  var source = RelayRecordSource.create();
  var record = RelayModernRecord.create(selector.dataID, typeName);
  source.set(selector.dataID, record);
  var relayPayload = RelayResponseNormalizer.normalize(source, selector, data, options);
  return _objectSpread({}, relayPayload, {
    errors: errors,
    isFinal: ((_response$extensions3 = response.extensions) === null || _response$extensions3 === void 0 ? void 0 : _response$extensions3.is_final) === true
  });
}

function stableStringify(value) {
  var _JSON$stringify;

  return (_JSON$stringify = JSON.stringify(stableCopy(value))) !== null && _JSON$stringify !== void 0 ? _JSON$stringify : ''; // null-check for flow
}

function validateOptimisticResponsePayload(payload) {
  var incrementalPlaceholders = payload.incrementalPlaceholders;

  if (incrementalPlaceholders != null && incrementalPlaceholders.length !== 0) {
    !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernQueryExecutor: optimistic responses cannot be returned ' + 'for operations that use incremental data delivery (@defer, ' + '@stream, and @stream_connection).') : invariant(false) : void 0;
  }
}

module.exports = {
  execute: execute
};