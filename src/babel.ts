import compileGraphQLTag from "babel-plugin-relay/lib/compileGraphQLTag";
import getValidGraphQLTag from "babel-plugin-relay/lib/getValidGraphQLTag";
import { loadConfig } from "./config";

export type RelayPluginOptions = {
  // The command to run to compile Relay files, used for error messages.
  buildCommand?: string;
  // Use haste style global requires, defaults to false.
  haste?: boolean;
  // Check this global variable before validation.
  isDevVariable?: string;

  // enable generating eager es modules for modern runtime
  eagerESModules?: boolean;

  // Directory as specified by artifactDirectory when running relay-compiler
  artifactDirectory?: string;
};

export type BabelState = {
  file?: any;
  opts?: RelayPluginOptions;
};

/**
 * Using babel-plugin-relay with only the modern runtime?
 *
 *     {
 *       plugins: [
 *         "relay"
 *       ]
 *     }
 */
module.exports = function BabelPluginRelay(context: { types: any }): any {
  const { types: t } = context;
  if (!t) {
    throw new Error(
      'BabelPluginRelay: Expected plugin context to include "types", but got:' +
        String(context)
    );
  }

  const visitor = {
    TaggedTemplateExpression(path, state) {
      // Convert graphql`` literals
      const ast = getValidGraphQLTag(path);
      if (ast) {
        compileGraphQLTag(t, path, state, ast);
        return;
      }
    },
  };

  return {
    visitor: {
      Program(path, state) {
        const config = loadConfig();
        path.traverse(visitor, {
          ...state,
          opts: { ...config, ...state.opts },
        });
      },
    },
  };
};
