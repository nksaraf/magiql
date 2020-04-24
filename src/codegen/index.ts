import { runMagiqlPlugin } from "./magiql-visitor";
import { runHooksPlugin } from "./hooks-visitor";
import { GraphQLSchema } from "graphql";
import { Types } from "@graphql-codegen/plugin-helpers";
import { MagiqlRawPluginConfig } from "./config";

export const plugin = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: MagiqlRawPluginConfig
) => {
  if (config.mode === "magic") {
    return runMagiqlPlugin(schema, documents, config);
  } else {
    return runHooksPlugin(schema, documents, config);
  }
};

