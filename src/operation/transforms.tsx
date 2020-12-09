import {
  SelectionNode,
  DocumentNode,
  SelectionSetNode,
  FragmentDefinitionNode,
  InlineFragmentNode,
  FieldNode,
} from "graphql";
import { visit } from "graphql/language/visitor";

import { constants } from "../types";

export const removeTypeNameFromOperation = (
  node: DocumentNode
): DocumentNode => {
  return visit(node, {
    OperationDefinition: (node) => {
      return {
        ...node,
        selectionSet: {
          ...node.selectionSet,
          selections: node.selectionSet.selections.filter(
            (sel) => !(sel.kind === "Field" && sel.name.value === "__typename")
          ),
        },
      };
    },
  });
};

export const addTypeName = (node: DocumentNode): DocumentNode => {
  return visit(node, {    
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
};

export const inlineFragments = (node: DocumentNode): DocumentNode => {
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

const deepTraverse = (
  node: SelectionSetNode,
  selectionMap: SelectionMap = new Map()
) => {
  let hasFlattened = false;
  const flatten = (node: SelectionSetNode) => {
    node.selections.forEach((sel) => {
      if (sel.kind === "InlineFragment") {
        flatten(sel.selectionSet);
        hasFlattened = true;
      } else if (sel.kind === "Field") {
        const key = sel.alias?.value ?? sel.name.value;

        const val = selectionMap.get(key);
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
          selectionMap.set(key, {
            ...sel,
            selectionSet: {
              ...sel.selectionSet,
              selections: fresh as any,
            },
          });
        } else {
          selectionMap.set(key, sel);
        }
      }
    });
  };

  flatten(node);

  return { selectionMap, hasFlattened };
};

export const flattenFragments = (node: DocumentNode): DocumentNode => {
  return visit(node, {
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
};
