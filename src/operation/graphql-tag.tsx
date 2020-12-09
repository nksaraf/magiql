import { GraphQLTaggedNode } from "../types";
import { parseGraphQLTag } from "./parser";

export const graphql: (
  strings: TemplateStringsArray,
  ...values: (GraphQLTaggedNode | string)[]
) => GraphQLTaggedNode | string = (strings, ...values) =>
  parseGraphQLTag(
    String.raw(
      strings,
      ...values
        .filter(Boolean)
        .map((val) => (typeof val === "string" ? val : (val as any).text))
    )
  );
