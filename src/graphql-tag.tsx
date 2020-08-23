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
): ConcreteRequest => {
  if (typeof taggedNode === "string") {
    const { operationName, operationKind } = getOperationName(taggedNode);
    return {
      kind: "Request",
      fragment: null,
      operation: null,
      params: {
        operationKind: operationKind,
        name: operationName,
        id: operationName,
        text: taggedNode,
        metadata: {},
      },
      // @ts-ignore
      query: taggedNode,
    };
  }
  return baseGetRequest(taggedNode);
};

export const getFragment = (
  taggedNode: GraphQLTaggedNode | string
): ReaderFragment | null => {
  return typeof taggedNode === "string" ? null : baseGetFragment(taggedNode);
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
  query: ConcreteRequest,
  variables: Variables<TQuery>
): OperationDescriptor<TQuery> {
  if (query.fragment === null) {
    return {
      request: {
        node: query,
        variables: variables,
        identifier: query.params.name,
      },
      response: {},
      fragment: null,
      root: null,
    };
  } else {
    return createOperationDescriptor(query, variables) as any;
  }
};

export const graphql: (
  strings: TemplateStringsArray
) => GraphQLTaggedNode | string = String.raw;
