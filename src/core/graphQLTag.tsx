import { GraphQLTaggedNode } from "./types";

export const graphql: (
  strings: TemplateStringsArray,
  ...values: (GraphQLTaggedNode | string)[]
) => GraphQLTaggedNode | string = String.raw;
