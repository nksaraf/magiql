// https://github.com/facebook/relay/blob/7c67b4750592e469d499128108fe16afe2adaf51/packages/relay-runtime/store/RelayModernSelector.js
import type { ConcreteRequest, ReaderFragment } from "relay-runtime";
import {
  getRequest as baseGetRequest,
  getFragment as baseGetFragment,
} from "relay-runtime/lib/query/GraphQLTag";

import { createOperationDescriptor } from "relay-runtime/lib/store/RelayModernOperationDescriptor";
import type {
  Query,
  Operation,
  Variables,
  GraphQLTaggedNode,
  FetchOptions,
} from "./types";
import { parseGraphQLTag } from "./parser";

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
    (request.params as any).text = (request as any).query;
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

export const createOperation = function <TQuery extends Query>(
  query: string | GraphQLTaggedNode,
  options: {
    variables: Variables<TQuery>;
    fetchOptions?: FetchOptions<Variables<TQuery>>;
  } = { variables: {} }
): Operation<TQuery> {
  const { variables = {}, fetchOptions = {} } = options;
  const node = getRequest(query);
  const operationDescriptor = createOperationDescriptor(
    node,
    variables
  ) as Operation<TQuery>;
  operationDescriptor.request.node.params.metadata.fetchOptions = fetchOptions;
  return operationDescriptor;
};
