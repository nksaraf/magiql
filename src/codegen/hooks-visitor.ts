import {
  ClientSideBaseVisitor,
  getConfigValue,
  LoadedFragment,
} from "@graphql-codegen/visitor-plugin-common";
import autoBind from "auto-bind";
import {
  visit,
  OperationDefinitionNode,
  Kind,
  concatAST,
  FragmentDefinitionNode,
} from "graphql";
import dedent from "dedent";
import { Types, PluginFunction } from "@graphql-codegen/plugin-helpers";
import { pascalCase } from "pascal-case";
import { GraphQLSchema } from "graphql";
import gql from "graphql-tag";
import { print } from "graphql/language/printer";
import { MagiqlRawPluginConfig, MagiqlPluginConfig } from "./config";

export class MagiqlVisitor extends ClientSideBaseVisitor<
  MagiqlRawPluginConfig,
  MagiqlPluginConfig
> {
  private _externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: MagiqlRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {
      importHooksFrom: getConfigValue(
        rawConfig.importHooksFrom,
        // "magiql"
        "./client"
      ),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
      codegen: getConfigValue(rawConfig.codegen, false),
      mode: getConfigValue(rawConfig.mode, "hooks-types")
    });

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : "";
    this._documents = documents;
    autoBind(this);
  }

  printFragments(document: OperationDefinitionNode) {
    if (!document) {
      return [];
    }
    const names = [];
    visit(document, {
      enter: {
        FragmentSpread: (node) => {
          names.push(node.name.value);
        },
      },
    });

    const fragmentNames = names.map((document) =>
      this.getFragmentName(document)
    );

    if (fragmentNames && fragmentNames.length > 0) {
      return `${fragmentNames
        .filter((name, i, all) => all.indexOf(name) === i)
        .map((name) => {
          const found = this._fragments.find(
            (f) => `${f.name}Fragment` === name
          );
          if (found) {
            return print(found.node);
          }
          return null;
        })
        .filter((a) => a)
        .join("\n")}`;
    }

    return "";
  }

  printDocument(node: OperationDefinitionNode) {
    const doc = `
${print(node).split("\\").join("\\\\")}
${this.printFragments(node)}`;
    const gqlObj = gql(doc);
    return print(gqlObj);
  }

  OperationDefinition(node: OperationDefinitionNode) {
    if (!node.name || !node.name.value) {
      return null;
    }
    this._collectedOperations.push(node);
    // const documentVariableName = this.convertName(node, {
    //   suffix: this.config.documentVariableSuffix,
    //   prefix: this.config.documentVariablePrefix,
    //   useTypesPrefix: false,
    // });
    // console.log(documentVariableName);
    // if (this.config.documentMode !== DocumentMode.external) {
    // let documentString = `${
    //   this.config.noExport ? "" : "export "
    // }var ${documentVariableName} = \`${this._gql(node)}\`;`;
    const operationType = pascalCase(node.operation);
    const operationTypeSuffix =
      this.config.dedupeOperationSuffix &&
      node.name.value.toLowerCase().endsWith(node.operation)
        ? ""
        : operationType;
    const operationResultType =
      this._externalImportPrefix +
      this.convertName(node, {
        suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
      });
    const operationVariablesTypes =
      this._externalImportPrefix +
      this.convertName(node, {
        suffix: operationTypeSuffix + "Variables",
      });

    const suffix = this._getHookSuffix(node.name.value, operationType);
    const operationName: string = this.convertName(node.name.value, {
      suffix,
      useTypesPrefix: false,
    });

    const document = `\`${this.printDocument(node)}\``;

    // let hook;

    if (this.config.mode === 'hooks-types') {
      this.imports.add(
        `import * as Magiql from "${this.config.importHooksFrom}";`
      );
      return `${
        this.config.noExport ? "" : "export "
      }function use${operationName}(options?: Magiql.Use${operationType}Options<${operationResultType}, ${operationVariablesTypes}>): Magiql.UseQueryResult<${operationResultType}, ${operationVariablesTypes}>;
      
      `
    } else if (this.config.mode === 'hooks-esm') {
      this.imports.add(
        `import * as Magiql from "${this.config.importHooksFrom}";`
      );

      return `${
        this.config.noExport ? "" : "export "
      }function use${operationName}(options) {
        return Magiql.use${operationType}(${document}, { opName: "${node.name.value}", ...options });
      }
      
      `
    } else if (this.config.mode === 'hooks-cjs') {
      this.imports.add(
        `const Magiql = require("${this.config.importHooksFrom}");`
      );

      return `${
        this.config.noExport ? "" : `module.exports.use${operationName} = `
      }function use${operationName}(_options) {
        const options = Object.assign({}, { opName: "${node.name.value}" }, _options);
        return Magiql.use${operationType}(` + JSON.stringify(this.printDocument(node)) + `, options);
      }
      
      `
    }
    // const hook  =
    //   this.config.codegen
    //     ? `function use${operationName}(options) {
    //     return Magiql.use${operationType}(${document}, { opName: "${node.name.value}", ...options });
    //   }`
    //     : `${
    //         this.config.noExport ? "" : "export "
    //       }function use${operationName}(options?: Magiql.Use${operationType}Options<${operationResultType}, ${operationVariablesTypes}>): Magiql.UseQueryResult<${operationResultType}, ${operationVariablesTypes}> {
    //     return Magiql.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${document}, options);
    //   }
    //   `;

    // if (this.config.addDocBlocks) {
    //   hookFns.unshift(this._buildHooksJSDoc(node, operationName, operationType));
    // }

    // const hookResults = [`export type ${operationName}HookResult = ReturnType<typeof use${operationName}>;`];

    // if (operationType === 'Query') {
    //   const lazyOperationName: string = this.convertName(node.name.value, {
    //     suffix: pascalCase('LazyQuery'),
    //     useTypesPrefix: false,
    //   });
    //   hookFns.push(
    //     `export function use${lazyOperationName}(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<${operationResultType}, ${operationVariablesTypes}>) {
    //       return ApolloReactHooks.useLazyQuery<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(node, documentVariableName)}, baseOptions);
    //     }`
    //   );
    //   hookResults.push(`export type ${lazyOperationName}HookResult = ReturnType<typeof use${lazyOperationName}>;`);
    // }

    // return hook;

    // if (node.type === "Fragment" && this.config.codegen) {
    //   return "";
    // }

    // if (this.config.codegen) {
      // return `module.exports.${operationName} = \`${[documentString, additional]
      //   .filter((a) => a)
      //   .join("\n")
      //   .replace(/\`/g, "\\`")}\`

      // module.exports.${documentVariableName} = \`${documentString.replace(
      //   /\`/g,
      //   "\\`"
      // )}\``;
      return "";
    // } else {
      // return [documentString, additional].filter((a) => a).join("\n");
      // return hook + "\n";
    // }
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    return [...Array.from(this.imports)];
  }

  //   private _buildHooksJSDoc(node: OperationDefinitionNode, operationName: string, operationType: string): string {
  //     const variableString = node.variableDefinitions.reduce((acc, item) => {
  //       const name = item.variable.name.value;

  //       return `${acc}\n *      ${name}: // value for '${name}'`;
  //     }, '');

  //     const queryDescription = `
  //  * To run a query within a React component, call \`use${operationName}\` and pass it any options that fit your needs.
  //  * When your component renders, \`use${operationName}\` returns an object from Apollo Client that contains loading, error, and data properties
  //  * you can use to render your UI.`;

  //     const queryExample = `
  //  * const { data, loading, error } = use${operationName}({
  //  *   variables: {${variableString}
  //  *   },
  //  * });`;

  //     const mutationDescription = `
  //  * To run a mutation, you first call \`use${operationName}\` within a React component and pass it any options that fit your needs.
  //  * When your component renders, \`use${operationName}\` returns a tuple that includes:
  //  * - A mutate function that you can call at any time to execute the mutation
  //  * - An object with fields that represent the current status of the mutation's execution`;

  //     const mutationExample = `
  //  * const [${camelCase(operationName)}, { data, loading, error }] = use${operationName}({
  //  *   variables: {${variableString}
  //  *   },
  //  * });`;

  //     return `
  // /**
  //  * __use${operationName}__
  //  *${operationType === 'Mutation' ? mutationDescription : queryDescription}
  //  *
  //  * @param baseOptions options that will be passed into the ${operationType.toLowerCase()}, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#${operationType === 'Mutation' ? 'options-2' : 'options'};
  //  *
  //  * @example${operationType === 'Mutation' ? mutationExample : queryExample}
  //  */`;
  //   }

  private _getHookSuffix(name: string, operationType: string) {
    if (!this.config.dedupeOperationSuffix) {
      return pascalCase(operationType);
    }
    if (
      name.includes("Query") ||
      name.includes("Mutation") ||
      name.includes("Subscription")
    ) {
      return "";
    }
    return pascalCase(operationType);
  }
}

export const runHooksPlugin: PluginFunction<MagiqlRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: MagiqlRawPluginConfig
) => {
  const allDocuments = concatAST(documents.map((v) => (v as any).document));

  const allFragments: LoadedFragment[] = [
    ...(allDocuments.definitions.filter(
      (d) => d.kind === Kind.FRAGMENT_DEFINITION
    ) as FragmentDefinitionNode[]).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ];

  const visitor = new MagiqlVisitor(
    schema,
    allFragments,
    config,
    documents
  );

  const visitorResult = visit(allDocuments, { enter: null, leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [
      ...visitorResult.definitions.filter((t) => typeof t === "string"),
    ].join("\n"),
  };
};
