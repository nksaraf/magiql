"use strict";

exports.__esModule = true;
exports.getLogger = getLogger;
exports.setLogger = setLogger;

var _utils = require("./utils");

// FUNCTIONS
var logger = console || {
  error: _utils.noop,
  warn: _utils.noop,
  log: _utils.noop
};

function getLogger() {
  return logger;
}

function setLogger(newLogger) {
  logger = newLogger;
}