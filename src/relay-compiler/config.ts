import { cosmiconfigSync, defaultLoaders } from "cosmiconfig";

import plugin from ".";

var explorer = cosmiconfigSync("magiql", {
  searchPlaces: ["magiql.config.js", "magiql.config.json", "package.json"],
  loaders: {
    ".json": defaultLoaders[".json"],
    ".yaml": defaultLoaders[".yaml"],
    ".yml": defaultLoaders[".yaml"],
    ".js": defaultLoaders[".js"],
    ".es6": defaultLoaders[".js"],
    noExt: defaultLoaders[".yaml"],
  },
});

export interface Config {
  schema: string;
  src: string;

  /**
   * A specific directory to output all artifacts to.
   * When enabling this the babel plugin needs `artifactDirectory` set as well.
   */
  artifactDirectory: string;
  extensions: string;
  verbose: boolean;
  quiet: boolean;
  watch: boolean;
  validate: boolean;
  watchman?: true;
  language?: string;
  include: string[];
  exclude: string[];
}

export function loadConfig() {
  var result = explorer.search();
  let config: any = {};
  if (result) {
    config = result.config;
  }

  const {
    keyFields = {},
    schema = "./schema.graphql",
    src = "./",
    artifactDirectory = "generated",
    extensions = ["js", "jsx", "ts", "tsx", "graphql"],
    verbose = false,
    quiet = false,
    watchman = true,
    validate = false,
    runWithBabel = true,
    language = "typescript",
    languagePlugin = plugin({ keyFields, language }),
    include = ["**"],
    exclude = [
      "**/node_modules/**",
      "**/__mocks__/**",
      `**/${artifactDirectory}/**`,
    ],
    ...rest
  } = config;

  return {
    keyFields,
    schema,
    src,
    artifactDirectory,
    extensions,
    runWithBabel,
    verbose,
    quiet,
    watchman,
    validate,
    language,
    languagePlugin,
    include,
    exclude,
    ...rest,
  };
}
