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
'use strict';

function reportMissingRequiredFields(environment, missingRequiredFields) {
  switch (missingRequiredFields.action) {
    case 'THROW':
      {
        var _missingRequiredField = missingRequiredFields.field,
            path = _missingRequiredField.path,
            owner = _missingRequiredField.owner;
        throw new Error("Relay: Missing @required value at path '".concat(path, "' in '").concat(owner, "'."));
      }

    case 'LOG':
      missingRequiredFields.fields.forEach(function (_ref) {
        var path = _ref.path,
            owner = _ref.owner;

        environment.__log({
          name: 'read.missing_required_field',
          owner: owner,
          fieldPath: path
        });
      });
      break;

    default:
      {
        missingRequiredFields.action;
      }
  }
}

module.exports = reportMissingRequiredFields;