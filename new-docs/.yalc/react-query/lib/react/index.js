"use strict";

exports.__esModule = true;
var _exportNames = {
  QueryClientProvider: true,
  useQueryClient: true,
  QueryErrorResetBoundary: true,
  useQueryErrorResetBoundary: true,
  useIsFetching: true,
  useMutation: true,
  useMutationObserver: true,
  useQuery: true,
  useQueries: true,
  useQueriesObserver: true,
  useInfiniteQuery: true,
  useQueryObserver: true
};
exports.useQueryObserver = exports.useInfiniteQuery = exports.useQueriesObserver = exports.useQueries = exports.useQuery = exports.useMutationObserver = exports.useMutation = exports.useIsFetching = exports.useQueryErrorResetBoundary = exports.QueryErrorResetBoundary = exports.useQueryClient = exports.QueryClientProvider = void 0;

require("./setBatchUpdatesFn");

require("./setLogger");

var _QueryClientProvider = require("./QueryClientProvider");

exports.QueryClientProvider = _QueryClientProvider.QueryClientProvider;
exports.useQueryClient = _QueryClientProvider.useQueryClient;

var _QueryErrorResetBoundary = require("./QueryErrorResetBoundary");

exports.QueryErrorResetBoundary = _QueryErrorResetBoundary.QueryErrorResetBoundary;
exports.useQueryErrorResetBoundary = _QueryErrorResetBoundary.useQueryErrorResetBoundary;

var _useIsFetching = require("./useIsFetching");

exports.useIsFetching = _useIsFetching.useIsFetching;

var _useMutation = require("./useMutation");

exports.useMutation = _useMutation.useMutation;

var _useMutationObserver = require("./useMutationObserver");

exports.useMutationObserver = _useMutationObserver.useMutationObserver;

var _useQuery = require("./useQuery");

exports.useQuery = _useQuery.useQuery;

var _useQueries = require("./useQueries");

exports.useQueries = _useQueries.useQueries;
exports.useQueriesObserver = _useQueries.useQueriesObserver;

var _useInfiniteQuery = require("./useInfiniteQuery");

exports.useInfiniteQuery = _useInfiniteQuery.useInfiniteQuery;

var _useQueryObserver = require("./useQueryObserver");

exports.useQueryObserver = _useQueryObserver.useQueryObserver;

var _types = require("./types");

Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  exports[key] = _types[key];
});