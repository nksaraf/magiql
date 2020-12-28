import { find } from "./FindGraphQLTags";
import { generate } from "./TypeScriptGenerator";
import {
  javascriptFormatterFactory,
  typescriptFormatterFactory,
} from "./formatGeneratedModule";
import { loadCompilerOptions } from "./loadCompilerOptions";
import { transforms, MagiqlQueryTransform } from "./transforms";

export default function getPlugin({ keyFields, language }) {
  return () => ({
    inputExtensions: ["ts", "tsx", "js", "jsx"],
    outputExtension: {
      javascript: "js",
      typescript: "ts",
    }[language],
    findGraphQLTags: find,
    formatModule: {
      javascript: javascriptFormatterFactory(),
      typescript: typescriptFormatterFactory(loadCompilerOptions()),
    }[language],
    typeGenerator: {
      generate,
      transforms: [
        ...transforms,
        MagiqlQueryTransform.transformWithOptions({ keyFields }),
      ],
    },
  });
}
