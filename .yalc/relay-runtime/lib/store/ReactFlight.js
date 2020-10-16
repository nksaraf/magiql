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

var invariant = require("fbjs/lib/invariant");

var _require = require('./RelayModernRecord'),
    getType = _require.getType;

var REACT_FLIGHT_QUERIES_STORAGE_KEY = 'queries';
var REACT_FLIGHT_TREE_STORAGE_KEY = 'tree';
var REACT_FLIGHT_TYPE_NAME = 'ReactFlightComponent';

function refineToReactFlightPayloadData(payload) {
  if (payload == null || typeof payload !== 'object' || !Array.isArray(payload.tree) || !Array.isArray(payload.queries)) {
    return null;
  }

  return payload;
}

function getReactFlightClientResponse(record) {
  !(getType(record) === REACT_FLIGHT_TYPE_NAME) ? process.env.NODE_ENV !== "production" ? invariant(false, 'getReactFlightClientResponse(): Expected a ReactFlightComponentRecord, ' + 'got %s.', record) : invariant(false) : void 0;
  var response = record[REACT_FLIGHT_TREE_STORAGE_KEY];

  if (response != null) {
    return response;
  }

  return null;
}

module.exports = {
  REACT_FLIGHT_QUERIES_STORAGE_KEY: REACT_FLIGHT_QUERIES_STORAGE_KEY,
  REACT_FLIGHT_TREE_STORAGE_KEY: REACT_FLIGHT_TREE_STORAGE_KEY,
  REACT_FLIGHT_TYPE_NAME: REACT_FLIGHT_TYPE_NAME,
  getReactFlightClientResponse: getReactFlightClientResponse,
  refineToReactFlightPayloadData: refineToReactFlightPayloadData
};