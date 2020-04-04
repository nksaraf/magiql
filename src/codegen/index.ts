import { TsVisitor, plugin as typescriptPlugin, includeIntrospectionDefinitions } from '@graphql-codegen/typescript';
import { Kind, printSchema,
  parse,
  visit } from 'graphql';
import { indent } from '@graphql-codegen/visitor-plugin-common';

class MagiqlVisitor extends TsVisitor {
  constructor(schema, config) {
    super(schema, config);
    (this._argumentsTransformer as any)._avoidOptionals = false;
    // this._argumentsTransformer.transform = (variablesNode) => {
    //   if (!variablesNode || variablesNode.length === 0) {
    //       return null;
    //   }
    //   return (variablesNode.map(variable => this._argumentsTransformer.transformVariable(variable)).join(', ');
    // }

  }

  FieldDefinition(node, key, parent) {
    let typeString = this.config.wrapFieldDefinitions ? `FieldWrapper<${node.type}>` : node.type;
    const originalFieldNode = parent[key];
    if (originalFieldNode.arguments.length > 0) {
      const args = originalFieldNode
        .arguments
        .map(variable => (this._argumentsTransformer as any).transformVariable(variable))
        .join(', ');
      typeString = `(args: { ${args} }) => ${typeString}`;
    }
    const addOptionalSign = !this.config.avoidOptionals.object && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = this.getFieldComment(node);
    const { type } = this.config.declarationKind;
    return (comment +
        indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${typeString}${this.getPunctuation(type)}`));
  }
}

const extra = `
import { UseQueryResult, UseQueryOptions } from './client/hooks';

export function useMagiqlQuery(name: string, options?: UseQueryOptions<any,any>): Omit<UseQueryResult<any,any>, "data"> & { query: Query }

export function useFragment<K extends keyof TypeMaps>(name: K): TypeMaps[K];`;

// import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
// import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
// import { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
// import { ReactApolloVisitor as ReactQueryVisitor } from './visitor';
// import { extname } from 'path';
// import { ReactApolloRawPluginConfig } from './config';

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


export const plugin = (schema, documents, config) => {
  const visitor = new MagiqlVisitor(schema, config);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor });
  let typeMap = `export type TypeMaps = {\n`;
  astNode.definitions.forEach(d => {
    if (d.kind === 'ObjectTypeDefinition') {
      typeMap += `  ${d.name.value}: ${d.name.value};\n`;
    }
  });
  typeMap += '}\n'
  const introspectionDefinitions = includeIntrospectionDefinitions(schema, documents, config);
  const scalars = visitor.scalarsDefinition;
  return {
      prepend: [...visitor.getEnumsImports(), ...visitor.getScalarsImports(), ...visitor.getWrapperDefinitions()],
      content: [scalars, ...visitorResult.definitions, ...introspectionDefinitions, typeMap, extra].join('\n'),
  };
};