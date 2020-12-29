"use strict";

exports.__esModule = true;
exports.useQuery = useQuery;

var _core = require("../core");

var _utils = require("../core/utils");

var _useQueryObserver = require("./useQueryObserver");

function useQuery(arg1, arg2, arg3) {
  var parsedOptions = (0, _utils.parseQueryArgs)(arg1, arg2, arg3);
  return (0, _useQueryObserver.useQueryObserver)(parsedOptions, _core.QueryObserver);
}