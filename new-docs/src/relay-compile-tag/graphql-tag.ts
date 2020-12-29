import type { GraphQLTaggedNode } from "relay-runtime";
import { parseGraphQLTag } from "./parser";

/**
 * A shim for relay's default `graphql` tag that uses the `relay-compiler`'s output and
 *  throws an error at runtime if that's missing. This tag will parse the document into the
 *  best approximation of the AST that the compiler would have produced.
 * 
 *  To include fragments, export them from the files they are declared in, be sure to give them
 *  the same name as the fragment itself, so they can be used like this:
 * 
 *  tsx```
 *  
 * import
 *  
 *  ```
 * 
 *  Missing features:
 *    - Fragments need to be included
 *    - List types are not detected since not schema aware
 * @param strings 
 * @param fragmentsOrValues 
 */
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
