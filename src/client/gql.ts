export function gql(query: TemplateStringsArray, ..._fragments: any) {
  return query.join("\n");
}