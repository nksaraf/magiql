import { GraphQLTaggedNode } from "../types";
import { parseGraphQLTag } from "./parser";

export const graphql: (
  strings: TemplateStringsArray,
  ...values: (GraphQLTaggedNode | string)[]
) => GraphQLTaggedNode | string = (strings, ...fragmentsOrValues) => {
  let rawGraphQL = "";
  let embedFrags = "";
  strings.forEach((string, i) => {
    if (i >= fragmentsOrValues.length) {
      rawGraphQL += string;
    } else {
      const val = fragmentsOrValues[i];
      if (typeof val === "object") {
        if (val.kind === "Fragment" && string.trimEnd().endsWith("...")) {
          rawGraphQL += string + (val as any).name;
          embedFrags += (val as any).text;
          return;
        } else if (val.kind === "Fragment" || val.kind === "Request") {
          rawGraphQL += string + (val as any).text;
        } else {
          rawGraphQL += string + JSON.stringify(val);
        }
      } else if (typeof val === "string") {
        rawGraphQL += string + val;
      } else {
        rawGraphQL += string + JSON.stringify(val);
      }
    }
  });

  const graphqlDoc = rawGraphQL + " " + embedFrags;

  return parseGraphQLTag(graphqlDoc);
};
