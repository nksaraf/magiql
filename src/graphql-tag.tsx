import {
  GraphQLTaggedNode,
  createOperationDescriptor,
  ConcreteRequest,
  ReaderFragment,
} from "relay-runtime";

import { Query, OperationDescriptor, Variables } from "./types";

import {
  getRequest as baseGetRequest,
  getFragment as baseGetFragment,
} from "relay-runtime";

export type { GraphQLTaggedNode } from "relay-runtime";

export const getRequest = (
  taggedNode: GraphQLTaggedNode | string
): ConcreteRequest | string => {
  return typeof taggedNode === "string"
    ? taggedNode
    : baseGetRequest(taggedNode);
};

export const getFragment = (
  taggedNode: GraphQLTaggedNode | string
): ReaderFragment | string => {
  return typeof taggedNode === "string"
    ? taggedNode
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

export const createOperation = function <TQuery extends Query>(
  query: ConcreteRequest | string,
  variables: Variables<TQuery>
): OperationDescriptor<TQuery> {
  if (typeof query === "string") {
    const { operationName, operationKind } = getOperationName(query);
    return {
      request: {
        node: {
          kind: "Request",
          fragment: null,
          operation: null,
          params: {
            operationKind: operationKind,
            name: operationName,
            id: operationName,
            text: query,
            metadata: {},
          },
          // @ts-ignore
          query: query,
        },
        variables: variables,
        identifier: operationName,
      },
      response: {},
      fragment: null,
      root: null,
    };
  } else {
    if (!query.operation && !query.fragment) {
      throw new Error("Use babel plugin");
    }
    return createOperationDescriptor(query, variables) as any;
  }
};

export const graphql: (
  strings: TemplateStringsArray
) => GraphQLTaggedNode | string = String.raw;
