import {
  GraphQLTaggedNode,
  createOperationDescriptor,
  ConcreteRequest,
} from "relay-runtime";

import { Query, OperationDescriptor, Variables } from "./types";

export { getRequest, getFragment } from "relay-runtime";

export type { GraphQLTaggedNode } from "relay-runtime";

export const createOperation = function <TQuery extends Query>(
  request: ConcreteRequest,
  variables: Variables<TQuery>
): OperationDescriptor<TQuery> {
  return createOperationDescriptor(request, variables) as any;
};

export function graphql(strings: TemplateStringsArray): GraphQLTaggedNode {
  if (typeof window !== "undefined") {
    console.warn(
      "graphql: Unexpected invocation at runtime. Either the Babel transform " +
        "was not set up, or it failed to identify this call site. Make sure it " +
        "is being used verbatim as `graphql`."
    );
  }
  return {} as any;
}
