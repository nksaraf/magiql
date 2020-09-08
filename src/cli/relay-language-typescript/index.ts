import { find } from "./FindGraphQLTags";
import { generate } from "./TypeScriptGenerator";
import { formatterFactory } from "./formatGeneratedModule";
import { loadCompilerOptions } from "./loadCompilerOptions";
import { transforms, MagiqlQueryTransform } from "./transforms";

export default function getPlugin({ keyFields }) {
  return () => ({
    inputExtensions: ["ts", "tsx"],
    outputExtension: "ts",
    findGraphQLTags: find,
    formatModule: formatterFactory(loadCompilerOptions()),
    typeGenerator: {
      generate,
      transforms: [
        ...transforms,
        MagiqlQueryTransform.transformWithOptions({ keyFields }),
      ],
    },
  });
}
