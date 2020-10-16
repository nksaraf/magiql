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

var RelayDeclarativeMutationConfig = require('../mutations/RelayDeclarativeMutationConfig');

var warning = require("fbjs/lib/warning");

var _require = require('../query/GraphQLTag'),
    getRequest = _require.getRequest;

var _require2 = require('../store/RelayModernOperationDescriptor'),
    createOperationDescriptor = _require2.createOperationDescriptor;

function requestSubscription(environment, config) {
  var subscription = getRequest(config.subscription);

  if (subscription.params.operationKind !== 'subscription') {
    throw new Error('requestSubscription: Must use Subscription operation');
  }

  var configs = config.configs,
      onCompleted = config.onCompleted,
      onError = config.onError,
      onNext = config.onNext,
      variables = config.variables,
      cacheConfig = config.cacheConfig;
  var operation = createOperationDescriptor(subscription, variables);
  process.env.NODE_ENV !== "production" ? warning(!(config.updater && configs), 'requestSubscription: Expected only one of `updater` and `configs` to be provided') : void 0;

  var _ref = configs ? RelayDeclarativeMutationConfig.convert(configs, subscription, null
  /* optimisticUpdater */
  , config.updater) : config,
      updater = _ref.updater;

  var sub = environment.execute({
    operation: operation,
    updater: updater,
    cacheConfig: cacheConfig
  }).map(function () {
    var data = environment.lookup(operation.fragment).data; // $FlowFixMe[incompatible-cast]

    return data;
  }).subscribe({
    next: onNext,
    error: onError,
    complete: onCompleted
  });
  return {
    dispose: sub.unsubscribe
  };
}

module.exports = requestSubscription;