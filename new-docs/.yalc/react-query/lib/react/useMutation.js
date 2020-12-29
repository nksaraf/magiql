"use strict";

exports.__esModule = true;
exports.useMutation = useMutation;

var _utils = require("../core/utils");

var _mutationObserver = require("../core/mutationObserver");

var _useMutationObserver = require("./useMutationObserver");

function useMutation(arg1, arg2, arg3) {
  var options = (0, _utils.parseMutationArgs)(arg1, arg2, arg3);
  return (0, _useMutationObserver.useMutationObserver)(options, _mutationObserver.MutationObserver);
}