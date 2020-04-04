"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _link = _interopRequireDefault(require("next/link"));

var _Layout = _interopRequireDefault(require("../components/Layout"));

var _magiql = require("magiql");

var __jsx = _react["default"].createElement;

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n      query pokemon($name: String) {\n        pokemon(name: $name) {\n          id\n          number\n          name\n          attacks {\n            special {\n              name\n              type\n              damage\n            }\n          }\n          image\n        }\n      }\n    "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var client = (0, _magiql.createClient)("https://graphql-pokemon.now.sh");

var Data = function Data() {
  var _useQuery = (0, _magiql.useQuery)((0, _magiql.gql)(_templateObject()), {
    variables: {
      name: "pikachu"
    }
  }),
      data = _useQuery.data,
      loading = _useQuery.loading,
      error = _useQuery.error;

  return __jsx("pre", null, JSON.stringify({
    loading: loading,
    data: data,
    error: error
  }, null, 2));
};

var OtherData = function OtherData() {
  var _data$pokemon_d59b;

  var _useQuery2 = (0, _magiql.useQuery)("query data {\n  pokemon_d59b: pokemon(name: ".concat(JSON.stringify("pikachu"), ") {\n    id\n  }\n}\n")),
      data = _useQuery2.data,
      loading = _useQuery2.loading,
      error = _useQuery2.error;

  if (loading) {
    return "loading...";
  }

  var _ref = (_data$pokemon_d59b = data.pokemon_d59b) !== null && _data$pokemon_d59b !== void 0 ? _data$pokemon_d59b : {},
      id = _ref.id;

  return __jsx("pre", null, JSON.stringify({
    loading: loading,
    data: {
      pokemon: id
    },
    error: error
  }, null, 2));
};

var IndexPage = function IndexPage() {
  return __jsx(_magiql.MagiqlProvider, {
    client: client
  }, __jsx(_Layout["default"], {
    title: "Home | Next.js + TypeScript Example"
  }, __jsx("h1", null, "Hello Next.js \uD83D\uDC4B"), __jsx("p", null, __jsx(_link["default"], {
    href: "/about"
  }, __jsx("a", null, "About"))), __jsx(OtherData, null)));
};

var _default = IndexPage;
exports["default"] = _default;
