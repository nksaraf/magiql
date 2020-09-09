import plugin from "./relay-compiler-language-typescript";
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
    language = plugin({ keyFields }),
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
    include,
    exclude,
    ...rest,
  };
}
