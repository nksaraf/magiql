/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
// flowlint ambiguous-object-type:error
'use strict';

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var ConnectionHandler = require('./ConnectionHandler');

var invariant = require("fbjs/lib/invariant");

var warning = require("fbjs/lib/warning");

var DeleteRecordHandler = {
  update: function update(store, payload) {
    var record = store.get(payload.dataID);

    if (record != null) {
      var idOrIds = record.getValue(payload.fieldKey);

      if (typeof idOrIds === 'string') {
        store["delete"](idOrIds);
      } else if (Array.isArray(idOrIds)) {
        idOrIds.forEach(function (id) {
          if (typeof id === 'string') {
            store["delete"](id);
          }
        });
      }
    }
  }
};
var DeleteEdgeHandler = {
  update: function update(store, payload) {
    var record = store.get(payload.dataID);

    if (record == null) {
      return;
    }

    var connections = payload.handleArgs.connections;
    !(connections != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MutationHandlers: Expected connection IDs to be specified.') : invariant(false) : void 0;
    var idOrIds = record.getValue(payload.fieldKey);
    var idList = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    idList.forEach(function (id) {
      if (typeof id === 'string') {
        var _iterator = _createForOfIteratorHelper(connections),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var connectionID = _step.value;
            var connection = store.get(connectionID);

            if (connection == null) {
              process.env.NODE_ENV !== "production" ? warning(false, "[Relay][Mutation] The connection with id '".concat(connectionID, "' doesn't exist.")) : void 0;
              continue;
            }

            ConnectionHandler.deleteNode(connection, id);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    });
  }
};
var AppendEdgeHandler = {
  update: edgeUpdater(ConnectionHandler.insertEdgeAfter)
};
var PrependEdgeHandler = {
  update: edgeUpdater(ConnectionHandler.insertEdgeBefore)
};
var AppendNodeHandler = {
  update: nodeUpdater(ConnectionHandler.insertEdgeAfter)
};
var PrependNodeHandler = {
  update: nodeUpdater(ConnectionHandler.insertEdgeBefore)
};

function edgeUpdater(insertFn) {
  return function (store, payload) {
    var record = store.get(payload.dataID);

    if (record == null) {
      return;
    }

    var connections = payload.handleArgs.connections;
    !(connections != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MutationHandlers: Expected connection IDs to be specified.') : invariant(false) : void 0;
    var serverEdge = record.getLinkedRecord(payload.fieldKey, payload.args);

    var _iterator2 = _createForOfIteratorHelper(connections),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var connectionID = _step2.value;
        var connection = store.get(connectionID);

        if (connection == null) {
          process.env.NODE_ENV !== "production" ? warning(false, "[Relay][Mutation] The connection with id '".concat(connectionID, "' doesn't exist.")) : void 0;
          continue;
        }

        var clientEdge = ConnectionHandler.buildConnectionEdge(store, connection, serverEdge);
        !(clientEdge != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MutationHandlers: Failed to build the edge.') : invariant(false) : void 0;
        insertFn(connection, clientEdge);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  };
}

function nodeUpdater(insertFn) {
  return function (store, payload) {
    var _serverNodes;

    var record = store.get(payload.dataID);

    if (record == null) {
      return;
    }

    var _payload$handleArgs = payload.handleArgs,
        connections = _payload$handleArgs.connections,
        edgeTypeName = _payload$handleArgs.edgeTypeName;
    !(connections != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MutationHandlers: Expected connection IDs to be specified.') : invariant(false) : void 0;
    !(edgeTypeName != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MutationHandlers: Expected edge typename to be specified.') : invariant(false) : void 0;
    var singleServerNode;
    var serverNodes;

    try {
      singleServerNode = record.getLinkedRecord(payload.fieldKey, payload.args);
    } catch (_unused) {}

    if (!singleServerNode) {
      try {
        serverNodes = record.getLinkedRecords(payload.fieldKey, payload.args);
      } catch (_unused2) {}
    }

    !(singleServerNode != null || serverNodes != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MutationHandlers: Expected target node to exist.') : invariant(false) : void 0;
    var serverNodeList = (_serverNodes = serverNodes) !== null && _serverNodes !== void 0 ? _serverNodes : [singleServerNode];

    var _iterator3 = _createForOfIteratorHelper(serverNodeList),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var serverNode = _step3.value;

        if (serverNode == null) {
          continue;
        }

        var _iterator4 = _createForOfIteratorHelper(connections),
            _step4;

        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var connectionID = _step4.value;
            var connection = store.get(connectionID);

            if (connection == null) {
              process.env.NODE_ENV !== "production" ? warning(false, "[Relay][Mutation] The connection with id '".concat(connectionID, "' doesn't exist.")) : void 0;
              continue;
            }

            var clientEdge = ConnectionHandler.createEdge(store, connection, serverNode, edgeTypeName);
            !(clientEdge != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'MutationHandlers: Failed to build the edge.') : invariant(false) : void 0;
            insertFn(connection, clientEdge);
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  };
}

module.exports = {
  AppendEdgeHandler: AppendEdgeHandler,
  DeleteRecordHandler: DeleteRecordHandler,
  PrependEdgeHandler: PrependEdgeHandler,
  AppendNodeHandler: AppendNodeHandler,
  PrependNodeHandler: PrependNodeHandler,
  DeleteEdgeHandler: DeleteEdgeHandler
};