"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.useHydrate = useHydrate;
exports.Hydrate = void 0;

var _react = _interopRequireDefault(require("react"));

var _react2 = require("../react");

var _hydration = require("./hydration");

function useHydrate(state, options) {
  var queryClient = (0, _react2.useQueryClient)();

  var optionsRef = _react.default.useRef(options);

  optionsRef.current = options; // Running hydrate again with the same queries is safe,
  // it wont overwrite or initialize existing queries,
  // relying on useMemo here is only a performance optimization

  _react.default.useMemo(function () {
    if (state) {
      (0, _hydration.hydrate)(queryClient, state, optionsRef.current);
    }
  }, [queryClient, state]);
}

var Hydrate = function Hydrate(_ref) {
  var children = _ref.children,
      options = _ref.options,
      state = _ref.state;
  useHydrate(state, options);
  return children;
};

exports.Hydrate = Hydrate;