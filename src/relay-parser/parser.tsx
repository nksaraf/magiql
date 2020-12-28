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
  InlineFragmentNode,
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
      } else if (sel.kind === "InlineFragment") {
        return {
          type: (sel as InlineFragmentNode).typeCondition.name.value,
          kind: "InlineFragment",
          selections: parseSelections(sel.selectionSet),
        };
      }
    }
  ) as any;

  return selections;
};

let OPERATION_COUNTER = 0;

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
    name: op.name ? op.name.value : "Operation" + OPERATION_COUNTER++,
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

  const requestName = requestDocument.name
    ? requestDocument.name.value
    : "Request" + OPERATION_COUNTER++;

  const queryText = print(requestDocument);
  return {
    kind: "Request",
    fragment: parseOperation(requestFragment) as ReaderFragment,
    operation: parseOperation(requestDocument),
    params: {
      operationKind: requestDocument.operation,
      name: requestName,
      id: null,
      cacheID: sum(queryText),
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
          "No GraphQL document (query/mutation/subscription/fragment) found"
        );
      }

      if (document.kind === "FragmentDefinition") {
        return parseFragment(node, taggedNode);
      } else {
        return parseRequest(node, taggedNode);
      }
    } catch (e) {
      throw e;
    }
  },
  (s) => s
);

// https://github.com/facebook/relay/blob/7c67b4750592e469d499128108fe16afe2adaf51/packages/relay-runtime/store/RelayModernSelector.js
import {
  getRequest as baseGetRequest,
  getFragment as baseGetFragment,
} from "relay-runtime/lib/query/GraphQLTag";

import type { GraphQLTaggedNode } from "../types";

export const getRequest = (
  taggedNode: GraphQLTaggedNode | string
): ConcreteRequest => {
  if (typeof taggedNode === "string") {
    return parseGraphQLTag(taggedNode) as ConcreteRequest;
  }

  // resolves the node from the require call for artifacts from relay-compiler, otherwise returns
  const request = baseGetRequest(taggedNode);

  // Previously parsed by magiql
  if (
    typeof request === "object" &&
    request.params.metadata?.parser === "graphql"
  ) {
    return request as ConcreteRequest;
  }
  // Parsed by relay (require call for artifact from relay-compiler)
  else {
    (request.params as any).metadata.parser = "relay";
    return request;
  }
};

export const getFragment = (
  taggedNode: GraphQLTaggedNode | string
): ReaderFragment | null => {
  return typeof taggedNode === "string"
    ? (parseGraphQLTag(taggedNode) as ReaderFragment)
    : baseGetFragment(taggedNode);
};

export const getOperationName = (query: string) => {
  const name = /(query|mutation|subscription) ([\w\d-_]+)/.exec(query);
  if (name && name.length && name[2]) {
    return {
      operationName: name[2],
      operationKind: name[1],
    };
  } else {
    throw new Error(
      "Invalid query. Must have a query name, eg. query MyQuery { ... }"
    );
  }
};
