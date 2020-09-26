"use strict";

import compileGraphQLTag from "babel-plugin-relay/lib/compileGraphQLTag";
import getValidGraphQLTag from "babel-plugin-relay/lib/getValidGraphQLTag";

import { createMacro } from "babel-plugin-macros";
import { loadConfig } from "./config";

const configName = "magiql";

function BabelPluginRelayMacro({ references, state, babel, config }) {
  const { types: t } = babel;
  Object.keys(references).forEach((referenceKey) => {
    references[referenceKey].forEach((reference) => {
      const loadedConfig = loadConfig();

      const path = reference.parentPath;
      const ast = getValidGraphQLTag(path);
      if (ast) {
        compileGraphQLTag(
          t,
          path,
          Object.assign(state, {
            opts: { ...(config ?? {}), ...loadedConfig },
          }),
          ast
        );
      }
    });
  });
}

module.exports = createMacro(BabelPluginRelayMacro, { configName });
