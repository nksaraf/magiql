import plugin from "./relay";
import { cosmiconfigSync, defaultLoaders } from "cosmiconfig";

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
