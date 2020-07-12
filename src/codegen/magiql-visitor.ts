import { TsVisitor } from "@graphql-codegen/typescript";
import {
  Kind,
  printSchema,
  parse,
  visit,
  GraphQLSchema,
  DocumentNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
} from "graphql";
import { indent } from "@graphql-codegen/visitor-plugin-common";
import { MagiqlRawPluginConfig, MagiqlPluginConfig } from "./config";
import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";

class MagiqlVisitor extends TsVisitor<
  MagiqlRawPluginConfig,
  MagiqlPluginConfig
> {
  currentNode?: string;
  constructor(schema: GraphQLSchema, config: MagiqlRawPluginConfig) {
    super(schema, config);
    (this._argumentsTransformer as any)._avoidOptionals = false;
  }

  // ObjectTypeDefinition(
  //   node: ObjectTypeDefinitionNode,
  //   key: number | string | undefined,
  //   parent: any
  // ) {
  //   // console.log(arguments);
  //   // super.ObjectTypeDefinition(node, key, parent);
  //   console.log(super.ObjectTypeDefinition(node, key, parent));
  //   return "";
  // }
  mergeAllFields(allFields, hasInterfaces) {
    return [
      ...allFields,
      `  fragment: (fragment?: MagiQLFragment) => Maybe<${this.currentNode}>;`,
    ].join("\n");
  }

  convertName(str: string) {
    this.currentNode = super.convertName(str);
    return this.currentNode;
  }
  // NamedType() {
  //   console.log(arguments);
  //   return "";
  // }

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
import { UseQueryResult, UseQueryOptions } from "./client/useQuery";

export type Type<K extends keyof Types = "Query"> = Types[K];

export type MagiQLFragment = (name?: string) => string;

export function useMagiqlQuery<TVariables = {}, TError = Error>(
  name: string,
  options?: UseQueryOptions<Query, TVariables, TError>
): Omit<UseQueryResult<Query, TError>, "data"> & {
  query: Query;
  variables: TVariables;
};

export function useFragment<K extends keyof Types>(name: K): Type<K>;

export type FragmentProps<F = {}> = {
  [K in keyof F]?: Maybe<F[K]>;
};

export type ComponentTypeWithFragment<
  F = {},
  P = {}
> = React.ComponentType<FragmentProps<F> & P>;

export type ComponentWithFragment<
  F extends FragmentDictionary,
  P = {}
> = ComponentTypeWithFragment<F, P> & { [K in keyof F]?: MagiQLFragment };

export function withFragment<F = {}, P = any>(
  Component: ComponentTypeWithFragment<F, P>
): ComponentWithFragment<F, P>;

`;

function getTypeMap(astNode: DocumentNode) {
  let typeMap = `export type Types = {\n`;
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
      'import React from "react";',
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
