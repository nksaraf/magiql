// import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment, OMIT_TYPE, DocumentMode } from '@graphql-codegen/visitor-plugin-common';
// import { ReactApolloRawPluginConfig } from './config';
// import autoBind from 'auto-bind';
// import { visit, OperationDefinitionNode, Kind } from 'graphql';
// import { Types } from '@graphql-codegen/plugin-helpers';
// import { pascalCase } from 'pascal-case';
// import { camelCase } from 'camel-case';
// import { GraphQLSchema } from 'graphql';
// import gql from 'graphql-tag';
// import { print } from "graphql/language/printer";

// export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
//   apolloReactHooksImportFrom: string;
//   addDocBlocks: boolean;
//   codegen: boolean;
// }

// export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
//   private _externalImportPrefix: string;
//   private imports = new Set<string>();

//   constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: ReactApolloRawPluginConfig, documents: Types.DocumentFile[]) {
//     super(schema, fragments, rawConfig, {
//       apolloReactHooksImportFrom: getConfigValue(rawConfig.apolloReactHooksImportFrom, '@apollo/react-hooks'),
//       addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
//       codegen: getConfigValue(rawConfig.codegen, false)
//     });

//     this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
//     this._documents = documents;
//     autoBind(this);
//   }

//   _extractFragments(document) {
//     if (!document) {
//         return [];
//     }
//     const names = [];
//     visit(document, {
//         enter: {
//             FragmentSpread: (node) => {
//                 names.push(node.name.value);
//                 console.log(node);
//             },
//         },
//     });
//     return names;
// }
// _transformFragments(document) {
//     return this._extractFragments(document).map(document => this._getFragmentName(document));
// }
// _includeFragments(fragments) {
//     if (fragments && fragments.length > 0) {
//             return `${fragments
//                 .filter((name, i, all) => all.indexOf(name) === i)
//                 .map(name => {
//                 const found = this._fragments.find(f => `${f.name}FragmentDoc` === name);
//                 if (found) {
//                     return print(found.node);
//                 }
//                 return null;
//             })
//                 .filter(a => a)
//                 .join('\n')}`;
//         }
//     return '';
// }
// _prepareDocument(documentStr) {
//     return documentStr;
// }
// _gql(node) {
  
//     const doc = this._prepareDocument(`
// ${print(node)
//         .split('\\')
//         .join('\\\\') /* Re-escape escaped values in GraphQL syntax */}
// ${this._includeFragments(this._transformFragments(node))}`);
//         const gqlObj = gql(doc);
//         return print(gqlObj)
// }

//   OperationDefinition(node) {
//     if (!node.name || !node.name.value) {
//         return null;
//     }
//     this._collectedOperations.push(node);
//     const documentVariableName = this.convertName(node, {
//         suffix: this.config.documentVariableSuffix,
//         prefix: this.config.documentVariablePrefix,
//         useTypesPrefix: false,
//     });
//     // if (this.config.documentMode !== DocumentMode.external) {
//         let documentString = `${this.config.noExport ? '' : 'export '}var ${documentVariableName} = \`${this._gql(node)}\`;`;
//     const operationType = pascalCase(node.operation);
//     const operationTypeSuffix = this.config.dedupeOperationSuffix && node.name.value.toLowerCase().endsWith(node.operation) ? '' : operationType;
//     const operationResultType = this.convertName(node, {
//         suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
//     });
//     const operationVariablesTypes = this.convertName(node, {
//         suffix: operationTypeSuffix + 'Variables',
//     });
//     const additional = this.buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes);
//     const suffix = this._getHookSuffix(node.name.value, operationType);
//     const operationName: string = this.convertName(node.name.value, {
//       suffix,
//       useTypesPrefix: false,
//     });

//     if (node.type === "Fragment" && this.config.codegen) {
//       return "";
//     }

//     if (this.config.codegen) {
//       return `module.exports.${operationName} = \`${[documentString, additional].filter(a => a).join('\n').replace(/\`/g, '\\\`')}\`
      
//       module.exports.${documentVariableName} = \`${documentString.replace(/\`/g, '\\\`')}\``;

//     } else {
//       return [documentString, additional].filter(a => a).join('\n');
//     }
// }

//   public getImports(): string[] {
//     const baseImports = super.getImports();
//     const hasOperations = this._collectedOperations.length > 0;

//     if (!hasOperations) {
//       return baseImports;
//     }

//     return [...Array.from(this.imports)];
//   }

//   // private _buildHocProps(operationName: string, operationType: string): string {
//   //   const typeVariableName = this._externalImportPrefix + this.convertName(operationName + pascalCase(operationType) + this._parsedConfig.operationResultSuffix);
//   //   const variablesVarName = this._externalImportPrefix + this.convertName(operationName + pascalCase(operationType) + 'Variables');
//   //   const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

//   //   this.imports.add(this.getApolloReactCommonImport());
//   //   this.imports.add(this.getApolloReactHocImport());

//   //   return `ApolloReactHoc.${argType}<${typeVariableName}, ${variablesVarName}>`;
//   // }

//   // private _buildMutationFn(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
//   //   if (node.operation === 'mutation') {
//   //     this.imports.add(this.getApolloReactCommonImport());
//   //     return `export type ${this.convertName(node.name.value + 'MutationFn')} = ApolloReactCommon.MutationFunction<${operationResultType}, ${operationVariablesTypes}>;`;
//   //   }
//   //   return null;
//   // }

// //   private _buildOperationHoc(node: OperationDefinitionNode, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
// //     this.imports.add(this.getApolloReactCommonImport());
// //     this.imports.add(this.getApolloReactHocImport());
// //     const operationName: string = this.convertName(node.name.value, { useTypesPrefix: false });
// //     const propsTypeName: string = this.convertName(node.name.value, { suffix: 'Props' });

// //     const propsVar = `export type ${propsTypeName}<TChildProps = {}> = ${this._buildHocProps(node.name.value, node.operation)} & TChildProps;`;

// //     const hocString = `export function with${operationName}<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<
// //   TProps,
// //   ${operationResultType},
// //   ${operationVariablesTypes},
// //   ${propsTypeName}<TChildProps>>) {
// //     return ApolloReactHoc.with${pascalCase(node.operation)}<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps>>(${this.getDocumentNodeVariable(node, documentVariableName)}, {
// //       alias: '${camelCase(operationName)}',
// //       ...operationOptions
// //     });
// // };`;

// //     return [propsVar, hocString].filter(a => a).join('\n');
// //   }

//   // private _buildComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
//   //   const componentPropsName: string = this.convertName(node.name.value, {
//   //     suffix: this.config.componentSuffix + 'Props',
//   //     useTypesPrefix: false,
//   //   });
//   //   const componentName: string = this.convertName(node.name.value, {
//   //     suffix: this.config.componentSuffix,
//   //     useTypesPrefix: false,
//   //   });

//   //   const isVariablesRequired = operationType === 'Query' && node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);

//   //   this.imports.add(this.getReactImport());
//   //   this.imports.add(this.getApolloReactCommonImport());
//   //   this.imports.add(this.getApolloReactComponentsImport());
//   //   this.imports.add(this.getOmitDeclaration());

//   //   const propsType = `Omit<ApolloReactComponents.${operationType}ComponentOptions<${operationResultType}, ${operationVariablesTypes}>, '${operationType.toLowerCase()}'>`;
//   //   let componentProps = '';
//   //   if (isVariablesRequired) {
//   //     componentProps = `export type ${componentPropsName} = ${propsType} & ({ variables: ${operationVariablesTypes}; skip?: boolean; } | { skip: boolean; });`;
//   //   } else {
//   //     componentProps = `export type ${componentPropsName} = ${propsType};`;
//   //   }

//   //   const component = `
//   //   export const ${componentName} = (props: ${componentPropsName}) => (
//   //     <ApolloReactComponents.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${this.getDocumentNodeVariable(node, documentVariableName)}} {...props} />
//   //   );
//   //   `;
//   //   return [componentProps, component].join('\n');
//   // }

// //   private _buildHooksJSDoc(node: OperationDefinitionNode, operationName: string, operationType: string): string {
// //     const variableString = node.variableDefinitions.reduce((acc, item) => {
// //       const name = item.variable.name.value;

// //       return `${acc}\n *      ${name}: // value for '${name}'`;
// //     }, '');

// //     const queryDescription = `
// //  * To run a query within a React component, call \`use${operationName}\` and pass it any options that fit your needs.
// //  * When your component renders, \`use${operationName}\` returns an object from Apollo Client that contains loading, error, and data properties 
// //  * you can use to render your UI.`;

// //     const queryExample = `
// //  * const { data, loading, error } = use${operationName}({
// //  *   variables: {${variableString}
// //  *   },
// //  * });`;

// //     const mutationDescription = `
// //  * To run a mutation, you first call \`use${operationName}\` within a React component and pass it any options that fit your needs.
// //  * When your component renders, \`use${operationName}\` returns a tuple that includes:
// //  * - A mutate function that you can call at any time to execute the mutation
// //  * - An object with fields that represent the current status of the mutation's execution`;

// //     const mutationExample = `
// //  * const [${camelCase(operationName)}, { data, loading, error }] = use${operationName}({
// //  *   variables: {${variableString}
// //  *   },
// //  * });`;

// //     return `
// // /**
// //  * __use${operationName}__
// //  *${operationType === 'Mutation' ? mutationDescription : queryDescription}
// //  *
// //  * @param baseOptions options that will be passed into the ${operationType.toLowerCase()}, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#${operationType === 'Mutation' ? 'options-2' : 'options'};
// //  *
// //  * @example${operationType === 'Mutation' ? mutationExample : queryExample}
// //  */`;
// //   }

//   private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
//     // console.log({ node, operationType, documentVariableName, operationResultType, operationVariablesTypes});
//     const suffix = this._getHookSuffix(node.name.value, operationType);
//     const operationName: string = this.convertName(node.name.value, {
//       suffix,
//       useTypesPrefix: false,
//     });

//     // console.log(operationResultType);

//     !this.config.codegen && this.imports.add(`import * as ReactQueryQL from "@lib/react-query-graphql";`);
//     !this.config.codegen && this.imports.add(`export function gql(query: TemplateStringsArray, ...fragments: any) { return undefined as any; };`);
//     // this.imports.add(this.getApolloReactHooksImport());

//     const hookFns = [
//       this.config.codegen ? `function use${operationName}(options) {
//         return ReactQueryQL.useGraphQL${operationType}(${documentVariableName}, { opName: "${node.name.value}", ...options });
//       }` : `${this.config.noExport ? "" : "export "}function use${operationName}(options?: ReactQueryQL.Use${operationType}Options<${operationResultType}, ${operationVariablesTypes}>) {
//         return ReactQueryQL.useGraphQL${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, options);
//       }`,
//     ];

//     // if (this.config.addDocBlocks) {
//     //   hookFns.unshift(this._buildHooksJSDoc(node, operationName, operationType));
//     // }

//     // const hookResults = [`export type ${operationName}HookResult = ReturnType<typeof use${operationName}>;`];

//     // if (operationType === 'Query') {
//     //   const lazyOperationName: string = this.convertName(node.name.value, {
//     //     suffix: pascalCase('LazyQuery'),
//     //     useTypesPrefix: false,
//     //   });
//     //   hookFns.push(
//     //     `export function use${lazyOperationName}(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<${operationResultType}, ${operationVariablesTypes}>) {
//     //       return ApolloReactHooks.useLazyQuery<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(node, documentVariableName)}, baseOptions);
//     //     }`
//     //   );
//     //   hookResults.push(`export type ${lazyOperationName}HookResult = ReturnType<typeof use${lazyOperationName}>;`);
//     // }

//     const hookResults = []

//     return [...(hookFns), ...hookResults].join('\n');
//   }

//   private _getHookSuffix(name: string, operationType: string) {
//     // if (this.config) {
//     //   return '';
//     // }
//     if (!this.config.dedupeOperationSuffix) {
//       return pascalCase(operationType);
//     }
//     if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
//       return '';
//     }
//     return pascalCase(operationType);
//   }

//   // private _buildResultType(node: OperationDefinitionNode, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
//   //   const componentResultType = this.convertName(node.name.value, {
//   //     suffix: `${operationType}Result`,
//   //     useTypesPrefix: false,
//   //   });

//   //   switch (node.operation) {
//   //     case 'query':
//   //       this.imports.add(this.getApolloReactCommonImport());
//   //       return `export type ${componentResultType} = ApolloReactCommon.QueryResult<${operationResultType}, ${operationVariablesTypes}>;`;
//   //     case 'mutation':
//   //       this.imports.add(this.getApolloReactCommonImport());
//   //       return `export type ${componentResultType} = ApolloReactCommon.MutationResult<${operationResultType}>;`;
//   //     case 'subscription':
//   //       this.imports.add(this.getApolloReactCommonImport());
//   //       return `export type ${componentResultType} = ApolloReactCommon.SubscriptionResult<${operationResultType}>;`;
//   //     default:
//   //       return '';
//   //   }
//   // }

//   // private _buildWithMutationOptionsType(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
//   //   if (node.operation !== 'mutation') {
//   //     return '';
//   //   }

//   //   this.imports.add(this.getApolloReactCommonImport());

//   //   const mutationOptionsType = this.convertName(node.name.value, { suffix: 'MutationOptions', useTypesPrefix: false });

//   //   return `export type ${mutationOptionsType} = ApolloReactCommon.BaseMutationOptions<${operationResultType}, ${operationVariablesTypes}>;`;
//   // }

//   // private _buildRefetchFn(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationVariablesTypes: string): string {
//   //   if (node.operation !== 'query') {
//   //     return '';
//   //   }

//   //   const operationName: string = this.convertName(node.name.value, {
//   //     suffix: this._getHookSuffix(node.name.value, operationType),
//   //     useTypesPrefix: false,
//   //   });

//   //   return `export function refetch${operationName}(variables?: ${operationVariablesTypes}) {
//   //     return { query: ${this.getDocumentNodeVariable(node, documentVariableName)}, variables: variables }
//   //   }`;
//   // }

//   protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
//     operationResultType = this._externalImportPrefix + operationResultType;
//     operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

//     // const mutationFn = this.config.withMutationFn || this.config.withComponent ? this._buildMutationFn(node, operationResultType, operationVariablesTypes) : null;
//     // const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
//     // const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
//     const hooks = this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes);
//     // console.log(hooks);
//     // console.log(hooks);
//     // const resultType = this.config.withResultType ? this._buildResultType(node, operationType, operationResultType, operationVariablesTypes) : null;
//     // const mutationOptionsType = this.config.withMutationOptionsType ? this._buildWithMutationOptionsType(node, operationResultType, operationVariablesTypes) : null;
//     // const refetchFn = this.config.withRefetchFn ? this._buildRefetchFn(node, documentVariableName, operationType, operationVariablesTypes) : null;

//     return [
//       // mutationFn, 
//       hooks, 
//       // resultType, 
//       // mutationOptionsType, 
//       // refetchFn
//       ]
//       .filter(a => a).join('\n');
//   }
// }
