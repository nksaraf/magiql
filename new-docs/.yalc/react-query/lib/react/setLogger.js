"use strict";

var _core = require("../core");

var _logger = require("./logger");

if (_logger.logger) {
  (0, _core.setLogger)(_logger.logger);
}