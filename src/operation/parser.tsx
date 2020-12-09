// Piggybacking off relay-runtime here
// https://github.com/facebook/relay/blob/7c67b4750592e469d499128108fe16afe2adaf51/packages/relay-runtime/store/RelayModernSelector.js
import {
  OperationDefinitionNode,
  DocumentNode,
  SelectionSetNode,
  FragmentDefinitionNode,
  ArgumentNode,
  VariableNode,
  IntValueNode,
  BooleanValueNode,
  FloatValueNode,
  StringValueNode,
  EnumValueNode,
  NullValueNode,
  ObjectFieldNode,
  ValueNode,
} from "graphql";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import sum from "hash-sum";
import type {
  ReaderFragment,
  NormalizationOperation,
  NormalizationSelection,
  ConcreteRequest,
  RequestParameters,
} from "relay-runtime";

import { memoized } from "../utils/memoized";
import {
  removeTypeNameFromOperation,
  addTypeName,
  flattenFragments,
  inlineFragments,
} from "./transforms";

const parseValue = (arg: ValueNode) => {
  switch (arg.kind) {
    case "IntValue":
    case "FloatValue":
      return Number(arg.value);
    case "BooleanValue":
      return arg.value;
    case "StringValue":
    case "EnumValue":
      return arg.value;
    case "NullValue":
      return null;
    case "ObjectValue":
      const value = {};
      arg.fields.forEach((field) => {
        value[field.name.value] = parseValue(field.value);
      });
      return value;
    case "ListValue":
      return arg.values.map(parseValue);
  }
};

function parseArgumentValue(arg: ValueNode) {
  switch (arg.kind) {
    case "Variable":
      return {
        kind: "Variable",
        variableName: arg.name.value,
      };
    case "BooleanValue":
    case "FloatValue":
    case "StringValue":
    case "EnumValue":
    case "NullValue":
    case "IntValue":
      return {
        kind: "Literal",
        value: parseValue(arg),
      };
    case "ObjectValue":
      return {
        kind: "ObjectValue",
        fields: parseArguments(arg.fields),
      };
    case "ListValue":
      return {
        kind: "ListValue",
        items: arg.values.map((val, index) => ({
          name: "arg" + index,
          ...parseArgumentValue(val),
        })),
      };
  }
}

function parseArguments(args: readonly (ArgumentNode | ObjectFieldNode)[]) {
  return args.map((arg) => {
    switch (arg.value.kind) {
      case "Variable":
      case "BooleanValue":
      case "FloatValue":
      case "StringValue":
      case "EnumValue":
      case "NullValue":
      case "IntValue":
      case "ObjectValue":
      case "ListValue":
        return {
          name: arg.name.value,
          ...parseArgumentValue(arg.value),
        };
    }
  });
}

const parseSelections = (selectionSet: SelectionSetNode) => {
  const selections: NormalizationSelection[] = selectionSet.selections.map(
    (sel) => {
      if (sel.kind === "Field") {
        if (sel.selectionSet) {
          return {
            name: sel.name.value,
            alias: sel.alias?.value,
            kind: "LinkedField",
            args: parseArguments(sel.arguments!),
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
            args: parseArguments(sel.arguments!),
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
    argumentDefinitions: op.variableDefinitions!.map((v) => ({
      name: v.variable.name.value,
      kind: "LocalArgument",
      defaultValue: v.defaultValue ? parseValue(v.defaultValue) : null,
    })),
    kind: "Operation",
    name: op.name!.value,
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
      name: requestDocument.name!.value,
      id: null,
      cacheID: requestDocument.name!.value,
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
      console.log(e);
      throw new Error("Error parsing GraphQL");
    }
  },
  (s) => s
);
