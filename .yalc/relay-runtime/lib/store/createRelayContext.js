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

var relayContext;
var firstReact;

function createRelayContext(react) {
  if (!relayContext) {
    relayContext = react.createContext(null);
    firstReact = react;
  }

  !(react === firstReact) ? process.env.NODE_ENV !== "production" ? invariant(false, '[createRelayContext]: You passing a different instance of React', react.version) : invariant(false) : void 0;
  return relayContext;
}

module.exports = createRelayContext;