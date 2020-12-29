"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.ThemeProvider = ThemeProvider;
exports.useTheme = useTheme;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

// @ts-nocheck
var ThemeContext = /*#__PURE__*/_react.default.createContext();

function ThemeProvider(_ref) {
  var theme = _ref.theme,
      rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["theme"]);
  return /*#__PURE__*/_react.default.createElement(ThemeContext.Provider, (0, _extends2.default)({
    value: theme
  }, rest));
}

function useTheme() {
  return _react.default.useContext(ThemeContext);
}