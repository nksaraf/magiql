// @ts-nocheck
import React from 'react';

var getItem = function getItem(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (_unused) {
    return undefined;
  }
};

export default function useLocalStorage(key, defaultValue) {
  var _React$useState = React.useState(function () {
    var val = getItem(key);

    if (typeof val === 'undefined' || val === null) {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }

    return val;
  }),
      value = _React$useState[0],
      setValue = _React$useState[1];

  var setter = React.useCallback(function (updater) {
    setValue(function (old) {
      var newVal = updater;

      if (typeof updater == 'function') {
        newVal = updater(old);
      }

      try {
        localStorage.setItem(key, JSON.stringify(newVal));
      } catch (_unused2) {}

      return newVal;
    });
  }, [key]);
  return [value, setter];
}