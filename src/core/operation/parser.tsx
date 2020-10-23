// Piggybacking off relay-runtime here
// https://github.com/facebook/relay/blob/7c67b4750592e469d499128108fe16afe2adaf51/packages/relay-runtime/store/RelayModernSelector.js
import type {
  ReaderFragment,
  NormalizationOperation,
  NormalizationSelection,
  ConcreteRequest,
  RequestParameters,
} from "relay-runtime";
import sum from "hash-sum";

import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";

import {
  OperationDefinitionNode,
  DocumentNode,
  SelectionSetNode,
  FragmentDefinitionNode,
} from "graphql";
import {
  removeTypeNameFromOperation,
  addTypeName,
  flattenFragments,
  inlineFragments,
} from "./transforms";
import { memoized } from "../../utils";

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
        return {
          args: null,
          kind: "FragmentSpread",
          name: sel.name.value,
        };
      }
    }
  ) as any;

  return selections;
};

const parseOperation = (
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

export const parseRequest = (
  node: DocumentNode,
  taggedNode: string
): ConcreteRequest => {
  const requestDocument = removeTypeNameFromOperation(
    addTypeName(flattenFragments(inlineFragments(node)))
  ).definitions.find(
    (def) => def.kind === "OperationDefinition"
  ) as OperationDefinitionNode;

  const requestFragment = node.definitions.find(
    (def) => def.kind === "OperationDefinition"
  ) as OperationDefinitionNode;

  const queryText = print(requestDocument);
  return {
    kind: "Request",
    fragment: parseOperation(requestFragment) as ReaderFragment,
    operation: parseOperation(requestDocument),
    text: taggedNode,
    params: {
      operationKind: requestDocument.operation,
      name: requestDocument.name.value,
      id: null,
      cacheID: requestDocument.name.value,
      // cacheID: sum(queryText),
      text: queryText,
      metadata: {
        parser: "graphql",
        // TODO: parse plural
      },
    } as RequestParameters,
  } as ConcreteRequest;
};

export const parseFragment = (
  node: DocumentNode,
  taggedNode: string
): ReaderFragment => {
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
    text: taggedNode,
  } as ReaderFragment;
};

export const parseGraphQLTag = memoized(
  (taggedNode: string): ReaderFragment | ConcreteRequest => {
    try {
      const node = parse(taggedNode);

      const document = node.definitions.find(
        (def) =>
          def.kind === "OperationDefinition" ||
          def.kind === "FragmentDefinition"
      ) as OperationDefinitionNode | FragmentDefinitionNode;

      if (!document) {
        throw new Error(
          "No GraphQL query/mutation/subscription/fragment found"
        );
      }
      if (document.kind === "FragmentDefinition") {
        return parseFragment(node, taggedNode);
      } else {
        return parseRequest(node, taggedNode);
      }
    } catch (e) {
      console.log("Error parsing GraphQL", e.message, taggedNode);
    }
  },
  (s) => s
);
