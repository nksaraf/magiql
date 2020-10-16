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

var warning = require("fbjs/lib/warning");

var validateMutation = function validateMutation() {};

if (process.env.NODE_ENV !== "production") {
  var addFieldToDiff = function addFieldToDiff(path, diff, isScalar) {
    var deepLoc = diff;
    path.split('.').forEach(function (key, index, arr) {
      if (deepLoc[key] == null) {
        deepLoc[key] = {};
      }

      if (isScalar && index === arr.length - 1) {
        deepLoc[key] = '<scalar>';
      }

      deepLoc = deepLoc[key];
    });
  };

  validateMutation = function validateMutation(optimisticResponse, mutation, variables) {
    var operationName = mutation.operation.name;
    var context = {
      path: 'ROOT',
      visitedPaths: new Set(),
      variables: variables || {},
      missingDiff: {},
      extraDiff: {}
    };
    validateSelections(optimisticResponse, mutation.operation.selections, context);
    validateOptimisticResponse(optimisticResponse, context);
    process.env.NODE_ENV !== "production" ? warning(context.missingDiff.ROOT == null, 'Expected `optimisticResponse` to match structure of server response for mutation `%s`, please define fields for all of\n%s', operationName, JSON.stringify(context.missingDiff.ROOT, null, 2)) : void 0;
    process.env.NODE_ENV !== "production" ? warning(context.extraDiff.ROOT == null, 'Expected `optimisticResponse` to match structure of server response for mutation `%s`, please remove all fields of\n%s', operationName, JSON.stringify(context.extraDiff.ROOT, null, 2)) : void 0;
  };

  var validateSelections = function validateSelections(optimisticResponse, selections, context) {
    selections.forEach(function (selection) {
      return validateSelection(optimisticResponse, selection, context);
    });
  };

  var validateSelection = function validateSelection(optimisticResponse, selection, context) {
    switch (selection.kind) {
      case 'Condition':
        validateSelections(optimisticResponse, selection.selections, context);
        return;

      case 'ScalarField':
      case 'LinkedField':
        return validateField(optimisticResponse, selection, context);

      case 'InlineFragment':
        var type = selection.type;
        var isConcreteType = selection.abstractKey == null;
        selection.selections.forEach(function (subselection) {
          if (isConcreteType && optimisticResponse.__typename !== type) {
            return;
          }

          validateSelection(optimisticResponse, subselection, context);
        });
        return;

      case 'ClientExtension':
        selection.selections.forEach(function (subselection) {
          validateSelection(optimisticResponse, subselection, context);
        });
        return;

      case 'ModuleImport':
      case 'LinkedHandle':
      case 'ScalarHandle':
      case 'Defer':
      case 'Stream':
      case 'TypeDiscriminator':
        {
          // TODO(T35864292) - Add missing validations for these types
          return;
        }

      case 'FlightField':
        throw new Error('Flight fields are not yet supported.');

      default:
        selection;
        return;
    }
  };

  var validateField = function validateField(optimisticResponse, field, context) {
    var fieldName = field.alias || field.name;
    var path = "".concat(context.path, ".").concat(fieldName);
    context.visitedPaths.add(path);

    switch (field.kind) {
      case 'ScalarField':
        if (optimisticResponse.hasOwnProperty(fieldName) === false) {
          addFieldToDiff(path, context.missingDiff, true);
        }

        return;

      case 'LinkedField':
        var selections = field.selections;

        if (optimisticResponse[fieldName] === null || Object.hasOwnProperty(fieldName) && optimisticResponse[fieldName] === undefined) {
          return;
        }

        if (field.plural) {
          if (Array.isArray(optimisticResponse[fieldName])) {
            optimisticResponse[fieldName].forEach(function (r) {
              if (r !== null) {
                validateSelections(r, selections, _objectSpread({}, context, {
                  path: path
                }));
              }
            });
            return;
          } else {
            addFieldToDiff(path, context.missingDiff);
            return;
          }
        } else {
          if (optimisticResponse[fieldName] instanceof Object) {
            validateSelections(optimisticResponse[fieldName], selections, _objectSpread({}, context, {
              path: path
            }));
            return;
          } else {
            addFieldToDiff(path, context.missingDiff);
            return;
          }
        }

    }
  };

  var validateOptimisticResponse = function validateOptimisticResponse(optimisticResponse, context) {
    if (Array.isArray(optimisticResponse)) {
      optimisticResponse.forEach(function (r) {
        if (r instanceof Object) {
          validateOptimisticResponse(r, context);
        }
      });
      return;
    }

    Object.keys(optimisticResponse).forEach(function (key) {
      var value = optimisticResponse[key];
      var path = "".concat(context.path, ".").concat(key);

      if (!context.visitedPaths.has(path)) {
        addFieldToDiff(path, context.extraDiff);
        return;
      }

      if (value instanceof Object) {
        validateOptimisticResponse(value, _objectSpread({}, context, {
          path: path
        }));
      }
    });
  };
}

module.exports = validateMutation;