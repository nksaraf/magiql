"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _magiql = require("magiql");

var _dynamic = _interopRequireDefault(require("next/dynamic"));

var _react = _interopRequireDefault(require("react"));

var __jsx = _react["default"].createElement;

function _templateObject() {
  var data = (0, _taggedTemplateLiteral2["default"])(["\n  query pokemon($name: String) {\n    # pokemons() {\n    #   id\n    # }\n    pokemon(name: $name) {\n      id\n      number\n      name\n      attacks {\n        special {\n          name\n          type\n          damage\n        }\n      }\n\n      image\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

var ReactQueryDevtools = undefined;

if (process.env.NODE_ENV === "development") {
  ReactQueryDevtools = (0, _dynamic["default"])(function () {
    return Promise.resolve().then(function () {
      return (0, _interopRequireWildcard2["default"])(require("".concat("react-query-devtools")));
    }).then(function (m) {
      return m.ReactQueryDevtools;
    });
  }, {
    ssr: true,
    loadableGenerated: {
      webpack: function webpack() {
        return [require.resolveWeak("react-query-devtools")];
      },
      modules: ["react-query-devtools"]
    }
  });
}

var client = (0, _magiql.createClient)("https://graphql-pokemon.now.sh");
(0, _magiql.gql)(_templateObject());

var PokemonSearch = function PokemonSearch() {
  var _ref = (0, _magiql.usePokemonQuery)({
    variables: {
      name: "pikachu"
    }
  }),
      data = _ref.data,
      loading = _ref.loading,
      error = _ref.error;

  return __jsx("pre", null, JSON.stringify({
    loading: loading,
    data: data,
    error: error
  }, null, 2));
}; // const MagicalPokemonSearch = () => {
//   const { query, loading, error }: any = useMagiqlQuery("searchPokemon");
//   if (loading) {
//     return <div>loading...</div>;
//   }
//   const pokemons = query
//     .pokemons({
//       first: 10,
//     })
//     ?.map((pokemon: Pokemon) => ({
//       image: pokemon?.image,
//       id: pokemon?.id,
//       name: pokemon?.name,
//     }));
//   return <pre>{JSON.stringify({ loading, pokemons, error }, null, 2)}</pre>;
// };


var IndexPage = function IndexPage() {
  return __jsx(_magiql.MagiqlProvider, {
    client: client
  }, __jsx(PokemonSearch, null), __jsx(ReactQueryDevtools, null));
};

var _default = IndexPage;
exports["default"] = _default;
