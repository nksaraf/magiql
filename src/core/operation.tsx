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

import { parse } from "graphql/language/parser";
import assert from "assert";

export const getRequest = (
  taggedNode: GraphQLTaggedNode | string
): ConcreteRequest => {
  if (typeof taggedNode === "string") {
    const node = parse(taggedNode);
    const document = node.definitions.find(
      (def) => def.kind === "OperationDefinition"
    );

    assert(document !== null && document.kind === "OperationDefinition");

    console.log(document);
    return {
      kind: "Request",
      fragment: document.selectionSet.selections.map(selection => {}),
      operation: null as any,
      params: {
        operationKind: document.operation,
        name: document.name.value,
        id: document.name.value,
        cacheID: "",
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

export const graphql: (strings, ...values) => GraphQLTaggedNode | string =
  String.raw;
