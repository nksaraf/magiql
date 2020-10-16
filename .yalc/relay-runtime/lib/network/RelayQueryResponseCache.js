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

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var invariant = require("fbjs/lib/invariant");

var stableCopy = require('../util/stableCopy');

/**
 * A cache for storing query responses, featuring:
 * - `get` with TTL
 * - cache size limiting, with least-recently *updated* entries purged first
 */
var RelayQueryResponseCache = /*#__PURE__*/function () {
  function RelayQueryResponseCache(_ref) {
    var size = _ref.size,
        ttl = _ref.ttl;
    !(size > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayQueryResponseCache: Expected the max cache size to be > 0, got ' + '`%s`.', size) : invariant(false) : void 0;
    !(ttl > 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayQueryResponseCache: Expected the max ttl to be > 0, got `%s`.', ttl) : invariant(false) : void 0;
    this._responses = new Map();
    this._size = size;
    this._ttl = ttl;
  }

  var _proto = RelayQueryResponseCache.prototype;

  _proto.clear = function clear() {
    this._responses.clear();
  };

  _proto.get = function get(queryID, variables) {
    var _this = this;

    var cacheKey = getCacheKey(queryID, variables);

    this._responses.forEach(function (response, key) {
      if (!isCurrent(response.fetchTime, _this._ttl)) {
        _this._responses["delete"](key);
      }
    });

    var response = this._responses.get(cacheKey);

    return response != null ? _objectSpread({}, response.payload, {
      extensions: _objectSpread({}, response.payload.extensions, {
        cacheTimestamp: response.fetchTime
      })
    }) : null;
  };

  _proto.set = function set(queryID, variables, payload) {
    var fetchTime = Date.now();
    var cacheKey = getCacheKey(queryID, variables);

    this._responses["delete"](cacheKey); // deletion resets key ordering


    this._responses.set(cacheKey, {
      fetchTime: fetchTime,
      payload: payload
    }); // Purge least-recently updated key when max size reached


    if (this._responses.size > this._size) {
      var firstKey = this._responses.keys().next();

      if (!firstKey.done) {
        this._responses["delete"](firstKey.value);
      }
    }
  };

  return RelayQueryResponseCache;
}();

function getCacheKey(queryID, variables) {
  return JSON.stringify(stableCopy({
    queryID: queryID,
    variables: variables
  }));
}
/**
 * Determine whether a response fetched at `fetchTime` is still valid given
 * some `ttl`.
 */


function isCurrent(fetchTime, ttl) {
  return fetchTime + ttl >= Date.now();
}

module.exports = RelayQueryResponseCache;