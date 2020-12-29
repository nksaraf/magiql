import { ReaderFragment, ConcreteRequest } from 'relay-runtime';
import {
  getRequest as getCompiledRequest,
  getFragment as getCompiledFragment,
} from 'relay-runtime';
import { GraphQLTaggedNode } from 'relay-runtime';
import { parseGraphQLTag } from './parser';

export const getRequest = (
  taggedNode: GraphQLTaggedNode | string,
): ConcreteRequest => {
  if (typeof taggedNode === 'string') {
    return parseGraphQLTag(taggedNode) as ConcreteRequest;
  }

  // resolves the node from the require call for artifacts from relay-compiler, otherwise returns
  const request = getCompiledRequest(taggedNode);

  // Previously parsed by magiql
  if (
    typeof request === 'object' &&
    request.params.metadata?.parser === 'graphql'
  ) {
    return request as ConcreteRequest;
  }

  // Parsed by relay (require call for artifact from relay-compiler)
  else {
    (request.params as any).metadata.parser = 'relay';
    return request;
  }
};

export const getFragment = (
  taggedNode: GraphQLTaggedNode | string,
): ReaderFragment | null => {
  return typeof taggedNode === 'string'
    ? (parseGraphQLTag(taggedNode) as ReaderFragment)
    : getCompiledFragment(taggedNode);
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
      'Invalid query. Must have a query name, eg. query MyQuery { ... }',
    );
  }
};
