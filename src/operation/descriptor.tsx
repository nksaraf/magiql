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
} from "../types";
import { parseRequest, parseFragment } from "./parser";

export const getRequest = (
  taggedNode: GraphQLTaggedNode | string
): ConcreteRequest => {
  if (typeof taggedNode === "string") {
    return parseRequest(taggedNode);
  }

  const request = baseGetRequest(taggedNode);
  if (
    typeof request === "object" &&
    request.params.metadata?.parser === "graphql"
  ) {
    return request as ConcreteRequest;
  } else {
    (request.params as any).text = (request as any).query;
    (request.params as any).metadata = {
      ...(request.params as any).metadata,
      parser: "relay",
    };
    return request;
  }
};

export const getFragment = (
  taggedNode: GraphQLTaggedNode | string
): ReaderFragment | null => {
  return typeof taggedNode === "string"
    ? parseFragment(taggedNode)
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
  const operationDescriptor = createOperationDescriptor(node, variables);
  return {
    ...operationDescriptor,
    request: {
      ...operationDescriptor.request,
      fetchOptions,
    },
    response: null,
  };
};
