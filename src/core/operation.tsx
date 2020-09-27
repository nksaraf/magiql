// Piggybacking off relay-runtime here
import {
  createOperationDescriptor,
  ConcreteRequest,
  ReaderFragment,
  getRequest as baseGetRequest,
  getFragment as baseGetFragment,
} from "relay-runtime";

import {
  Query,
  Operation,
  Variables,
  GraphQLTaggedNode,
  FetchOptions,
} from "./types";

export const getRequest = (
  taggedNode: GraphQLTaggedNode | string
): ConcreteRequest => {
  if (typeof taggedNode === "string") {
    const { operationName, operationKind } = getOperationName(taggedNode);
    return {
      kind: "Request",
      fragment: null as any,
      operation: null as any,
      params: {
        operationKind,
        name: operationName,
        id: operationName,
        text: taggedNode,
        metadata: {},
      },
    };
  }
  const request = baseGetRequest(taggedNode);
  (request.params as any).text = (request as any).query;
  return request;
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
  query: string | GraphQLTaggedNode,
  variables: Variables<TQuery> = {},
  fetchOptions: FetchOptions<Variables<TQuery>> = {}
): Operation<TQuery> {
  const node = getRequest(query);
  if (node.fragment === null) {
    return {
      request: {
        fetchOptions: fetchOptions,
        node: node,
        variables,
        identifier: node.params.name,
      },
      response: null as any,
      fragment: null as any,
      root: null as any,
    };
  } else {
    const operationDescriptor = createOperationDescriptor(
      node,
      variables
    ) as any;

    return {
      ...operationDescriptor,
      request: {
        ...operationDescriptor.request,
        fetchOptions,
      },
    };
  }
};

export const graphql: (
  strings: TemplateStringsArray
) => GraphQLTaggedNode | string = String.raw;
