

// import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
// import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
// import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
// import { ReactApolloVisitor as ReactQueryVisitor } from './visitor';
// import { extname } from 'path';
// import { ReactApolloRawPluginConfig } from './config';

import { runMagiqlPlugin } from "./magiql-visitor";
import { runHooksPlugin } from "./hooks-visitor";
import { GraphQLSchema } from "graphql";
import { Types } from "@graphql-codegen/plugin-helpers";
import { MagiqlRawPluginConfig } from "./config";

// export const plugin: PluginFunction<ReactApolloRawPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: ReactApolloRawPluginConfig) => {

//   const allAst = concatAST(documents.map(v => (v as any).document));

//   const allFragments: LoadedFragment[] = [
//     ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
//     ...(config.externalFragments || []),
//   ];

//   const visitor = new ReactQueryVisitor(schema, allFragments, config, documents);


//   // console.log(documents);
//   const visitorResult = visit(allAst, { enter: null, leave: visitor });
//   return {
//     prepend: visitor.getImports(),
//     content: [...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n'),
//   };
// };

// export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: ReactApolloRawPluginConfig, outputFile: string) => {
//   // if (config.withComponent === false) {
//   //   if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
//   //     throw new Error(`Plugin "react-apollo" with "noComponents" requires extension to be ".ts" or ".tsx"!`);
//   //   }
//   // } else {
//   //   if (extname(outputFile) !== '.tsx') {
//   //     throw new Error(`Plugin "react-apollo" requires extension to be ".tsx"!`);
//   //   }
//   // }
// };

// export { ReactQueryVisitor as ReactApolloVisitor };


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

