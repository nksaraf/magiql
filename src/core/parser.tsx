// Piggybacking off relay-runtime here
import type {
  ReaderFragment,
  NormalizationOperation,
  NormalizationField,
  NormalizationScalarField,
  NormalizationSelection,
} from "relay-runtime";


import {
  constants,
} from "./types";

import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import { visit } from "graphql/language/visitor";

import {
  OperationTypeNode,
  OperationDefinitionNode,
  SelectionNode,
  DocumentNode,
  SelectionSetNode,
  FragmentDefinitionNode,
  InlineFragmentNode,
  FieldNode,
} from "graphql";

const parseSelections = (selectionSet: SelectionSetNode) => {
  const selections: NormalizationSelection[] = selectionSet.selections.map(
    (sel) => {
      if (sel.kind === "Field") {
        if (sel.selectionSet) {
          return {
            name: sel.name.value,
            alias: sel.alias?.value,
            kind: "LinkedField",
            args: sel.arguments.map((arg) => ({
              kind: arg.value.kind === "Variable" ? "Variable" : "Literal",
              ...(arg.value.kind === "Variable"
                ? {
                    variableName: arg.value.name.value,
                  }
                : {
                    value: (arg.value as any).value,
                  }),
              name: arg.name.value,
            })),
            plural: undefined,
            storageKey: null,
            concreteType: null,
            selections: parseSelections(sel.selectionSet),
          };
        } else {
          return {
            name: sel.name.value,
            alias: sel.alias?.value,
            kind: "ScalarField",
            concreteType: null,
            args: sel.arguments.map((arg) => ({
              kind: arg.value.kind === "Variable" ? "Variable" : "Literal",
              ...(arg.value.kind === "Variable"
                ? {
                    variableName: arg.value.name.value,
                  }
                : {
                    value: (arg.value as any).value,
                  }),
              name: arg.name.value,
            })),
            plural: undefined,
          };
        }
      } else if (sel.kind === "FragmentSpread") {
        // if (collapse) {
        //   const foundFragment = fragments.find(
        //     (frag) => frag.name.value === sel.name.value
        //   );

        //   if (!foundFragment) {
        //     throw new Error(`Could not find fragment ${sel.name.value}`);
        //   }
        //   //   return {
        //   //     name: sel.name.value,
        //   //     alias: sel.alias?.value,
        //   //     kind: "LinkedField",
        //   //     args: sel.arguments.map((arg) => ({
        //   //       kind: arg.value.kind === "Variable" ? "Variable" : "Literal",
        //   //       ...(arg.value.kind === "Variable"
        //   //         ? {
        //   //             variableName: arg.value.name.value,
        //   //           }
        //   //         : {
        //   //             value: (arg.value as any).value,
        //   //           }),
        //   //       name: arg.name.value,
        //   //     })),
        //   //     plural: undefined,
        //   //     storageKey: null,
        //   //     concreteType: null,
        //   //     selections: parseSelections(sel.selectionSet, fragments, collapse),
        //   //   };

        //   parseSelections(foundFragment.selectionSet, fragments, collapse);
        // } else {
        return {
          args: null,
          kind: "FragmentSpread",
          name: sel.name.value,
        };
        // }
      }
    }
  ) as any;
  // .flat() as any;

  return selections;
};

const parsedOperation = (
  op: OperationDefinitionNode
): NormalizationOperation => {
  return {
    argumentDefinitions: op.variableDefinitions.map((v) => ({
      name: v.variable.name.value,
      kind: "LocalArgument",
      defaultValue:
        {
          IntValue: Number((v.defaultValue as any)?.value),
          FloatValue: Number((v.defaultValue as any)?.value),
          BooleanValue: Boolean((v.defaultValue as any)?.value === true),
          Variable: (v.defaultValue as any)?.value,
          StringValue: (v.defaultValue as any)?.value,
        }[v.defaultValue?.kind] ?? (v.defaultValue as any)?.value, // TODO
    })),
    kind: "Operation",
    name: op.name.value,
    selections: parseSelections(op.selectionSet),
  };
};

const addTypeName = (node: DocumentNode): DocumentNode => {
  const doc = visit(node, {
    SelectionSet: (node) => {
      const typeName = node.selections.find(
        (sel) =>
          sel.kind === "Field" && sel.name.value === constants.TYPENAME_KEY
      );

      if (!typeName) {
        return {
          ...node,
          selections: [
            ...node.selections,
            {
              arguments: [],
              selectionSet: null,
              alias: null,
              name: {
                value: constants.TYPENAME_KEY,
                kind: "Name",
              },
              kind: "Field",
            } as SelectionNode,
          ],
        };
      } else {
        return node;
      }
    },
  });

  return doc;
};

const inlineFragments = (node: DocumentNode): DocumentNode => {
  const fragments: FragmentDefinitionNode[] = node.definitions.filter(
    (def) => def.kind === "FragmentDefinition"
  ) as any;

  const doc = visit(node, {
    FragmentSpread: (node) => {
      const fragment = fragments.find(
        (frag) => frag.name.value === node.name.value
      );

      if (fragment) {
        return {
          kind: "InlineFragment",
          typeCondition: fragment.typeCondition,
          selectionSet: fragment.selectionSet,
          directives: fragment.directives,
          loc: fragment.loc,
        } as InlineFragmentNode;
      } else {
        throw new Error(
          `Missing fragment definition (forgot to add fragment?): ${node.name.value}`
        );
        return null;
      }
    },
  });

  return {
    ...doc,
    definitions: [
      doc.definitions.find((doc) => (def) =>
        def.kind === "OperationDefinition"
      ),
    ],
  };
};

type SelectionMap = Map<string, FieldNode>;

const deepTraverse = (node, selectionMap: SelectionMap = new Map()) => {
  let hasFlattened = false;
  const flatter = (node: SelectionSetNode) => {
    node.selections.forEach((sel) => {
      if (sel.kind === "InlineFragment") {
        flatter(sel.selectionSet);
        hasFlattened = true;
      } else if (sel.kind === "Field") {
        const val = selectionMap.get(sel.alias?.value ?? sel.name.value);
        const key = sel.alias?.value ?? sel.name.value;
        if (sel.selectionSet) {
          const set =
            val && val.selectionSet
              ? (val.selectionSet.selections as any)
              : new Map();

          const {
            selectionMap: fresh,
            hasFlattened: hasChildFlattened,
          } = deepTraverse(sel.selectionSet, set);
          if (hasChildFlattened) {
            hasFlattened = true;
          }
          selectionMap.set(sel.alias?.value ?? sel.name.value, {
            ...sel,
            selectionSet: {
              ...sel.selectionSet,
              selections: fresh as any,
            },
          });
        } else {
          selectionMap.set(sel.alias?.value ?? sel.name.value, sel);
        }
      }
    });
  };

  flatter(node);

  return { selectionMap, hasFlattened };
};

const flattenFragments = (node: DocumentNode): DocumentNode => {
  const doc = visit(node, {
    SelectionSet: (node) => {
      const { selectionMap, hasFlattened } = deepTraverse(node);

      function transform(selectionMap: SelectionMap) {
        return Array.from(selectionMap.values()).map((val) => {
          if (val.kind === "Field") {
            if (val.selectionSet) {
              return {
                ...val,
                selectionSet: {
                  ...val.selectionSet,
                  selections: transform(val.selectionSet.selections as any),
                },
              };
            } else {
              return val;
            }
          }
        });
      }

      return hasFlattened
        ? {
            ...node,
            selections: transform(selectionMap),
          }
        : node;
    },
  });

  return doc;
};

export const parseRequest = (taggedNode: string) => {
  const node = parse(taggedNode);
  const flatNode = flattenFragments(inlineFragments(node));
  const flatNodeWithTypename = addTypeName(flatNode);

  const document = flatNodeWithTypename.definitions.find(
    (def) => def.kind === "OperationDefinition"
  ) as OperationDefinitionNode;

  return {
    kind: "Request",
    fragment: parsedOperation(
      node.definitions.find(
        (def) => def.kind === "OperationDefinition"
      ) as OperationDefinitionNode
    ) as ReaderFragment,
    operation: parsedOperation(document),
    params: {
      operationKind: document.operation,
      name: document.name.value,
      id: document.name.value,
      cacheID: "",
      text: print(document),
      metadata: {
        parser: "graphql",
      },
    },
  };
};

export const parseFragment = (taggedNode: string) => {
  const node = parse(taggedNode);

  const fragment = node.definitions.find(
    (def) => def.kind === "FragmentDefinition"
  ) as FragmentDefinitionNode;

  return {
    kind: "Fragment",
    argumentDefinitions: [],
    metadata: null,
    name: fragment.name.value,
    selections: parseSelections(fragment.selectionSet),
    type: fragment.typeCondition.name.value,
    abstractKey: null,
  } as ReaderFragment;
};


