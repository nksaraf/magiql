import { TsVisitor } from "@graphql-codegen/typescript";
import {
  Kind,
  printSchema,
  parse,
  visit,
  GraphQLSchema,
  DocumentNode,
  FieldDefinitionNode,
} from "graphql";
import { indent } from "@graphql-codegen/visitor-plugin-common";
import { MagiqlRawPluginConfig, MagiqlPluginConfig } from "./config";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";

class MagiqlVisitor extends TsVisitor<
  MagiqlRawPluginConfig,
  MagiqlPluginConfig
> {
  constructor(schema: GraphQLSchema, config: MagiqlRawPluginConfig) {
    super(schema, config);
    (this._argumentsTransformer as any)._avoidOptionals = false;
  }

  FieldDefinition(
    node: FieldDefinitionNode,
    key?: number | string,
    parent?: any
  ) {
    let typeString = this.config.wrapFieldDefinitions
      ? `FieldWrapper<${node.type}>`
      : node.type;
    const originalFieldNode = parent[key];
    if (originalFieldNode.arguments.length > 0) {
      const args = originalFieldNode.arguments
        .map((variable) =>
          (this._argumentsTransformer as any).transformVariable(variable)
        )
        .join(", ");
      typeString = `(args: { ${args} }) => ${typeString}`;
    }
    const addOptionalSign =
      !this.config.avoidOptionals.object &&
      originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = this.getFieldComment(node);
    const { type } = this.config.declarationKind;
    return (
      comment +
      indent(
        `${this.config.immutableTypes ? "readonly " : ""}${node.name}${
          addOptionalSign ? "?" : ""
        }: ${typeString}${this.getPunctuation(type)}`
      )
    );
  }
}

const extra = `
import { UseQueryResult, UseQueryOptions } from './client/hooks';

export function useMagiqlQuery<TVariables>(name: string, options?: UseQueryOptions<any, TVariables>): Omit<UseQueryResult<any,TVariables>, "data"> & { query: Query, variables: TVariables }

export function useFragment<K extends keyof TypeMaps>(name: K): TypeMaps[K];`;

function getTypeMap(astNode: DocumentNode) {
  let typeMap = `type TypeMaps = {\n`;
  astNode.definitions.forEach((d) => {
    if (d.kind === "ObjectTypeDefinition") {
      typeMap += `  ${d.name.value}: ${d.name.value};\n`;
    }
  });
  typeMap += "}\n";
  return typeMap;
}

export const runMagiqlPlugin: PluginFunction<MagiqlRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: MagiqlRawPluginConfig
) => {
  const visitor = new MagiqlVisitor(schema, config);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor });
  let typeMap = getTypeMap(astNode);
  // const introspectionDefinitions = includeIntrospectionDefinitions(schema, documents, config);
  const scalars = visitor.scalarsDefinition;
  return {
    prepend: [
      ...visitor.getEnumsImports(),
      ...visitor.getScalarsImports(),
      ...visitor.getWrapperDefinitions(),
    ],
    content: [
      scalars,
      ...visitorResult.definitions,
      // ...introspectionDefinitions,
      typeMap,
      extra,
    ].join("\n"),
  };
};
