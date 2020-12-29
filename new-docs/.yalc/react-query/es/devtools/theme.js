import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
// @ts-nocheck
import React from 'react';
var ThemeContext = /*#__PURE__*/React.createContext();
export function ThemeProvider(_ref) {
  var theme = _ref.theme,
      rest = _objectWithoutPropertiesLoose(_ref, ["theme"]);

  return /*#__PURE__*/React.createElement(ThemeContext.Provider, _extends({
    value: theme
  }, rest));
}
export function useTheme() {
  return React.useContext(ThemeContext);
}