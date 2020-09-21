/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PeopleQueryVariables = {
  limit?: number | null;
  after?: string | null;
};
export type PeopleQueryResponse = {
  readonly allPeople: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null;
        readonly homeworld: {
          readonly name: string | null;
        } | null;
      } | null;
      readonly cursor: string;
    } | null> | null;
    readonly pageInfo: {
      readonly hasNextPage: boolean;
      readonly endCursor: string | null;
    };
  } | null;
};
export type PeopleQuery = {
  readonly response: PeopleQueryResponse;
  readonly variables: PeopleQueryVariables;
};

/**QUERY**
query PeopleQuery(
  $limit: Int = 10
  $after: String
) {
  allPeople(first: $limit, after: $after) {
    edges {
      node {
        id
        name
        homeworld {
          name
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
****/

/*
query PeopleQuery(
  $limit: Int = 10
  $after: String
) {
  allPeople(first: $limit, after: $after) {
    edges {
      node {
        id
        name
        homeworld {
          name
          id
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
*/

const node: ConcreteRequest = (function () {
  var v0 = {
      defaultValue: null,
      kind: "LocalArgument",
      name: "after",
    },
    v1 = {
      defaultValue: 10,
      kind: "LocalArgument",
      name: "limit",
    },
    v2 = [
      {
        kind: "Variable",
        name: "after",
        variableName: "after",
      },
      {
        kind: "Variable",
        name: "first",
        variableName: "limit",
      },
    ],
    v3 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "id",
      storageKey: null,
    },
    v4 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "name",
      storageKey: null,
    },
    v5 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "cursor",
      storageKey: null,
    },
    v6 = {
      alias: null,
      args: null,
      concreteType: "PageInfo",
      kind: "LinkedField",
      name: "pageInfo",
      plural: false,
      selections: [
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "hasNextPage",
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "endCursor",
          storageKey: null,
        },
      ],
      storageKey: null,
    };
  return {
    fragment: {
      argumentDefinitions: [v0 /*: any*/, v1 /*: any*/],
      kind: "Fragment",
      metadata: null,
      name: "PeopleQuery",
      selections: [
        {
          alias: null,
          args: v2 /*: any*/,
          concreteType: "PeopleConnection",
          kind: "LinkedField",
          name: "allPeople",
          plural: false,
          selections: [
            {
              alias: null,
              args: null,
              concreteType: "PeopleEdge",
              kind: "LinkedField",
              name: "edges",
              plural: true,
              selections: [
                {
                  alias: null,
                  args: null,
                  concreteType: "Person",
                  kind: "LinkedField",
                  name: "node",
                  plural: false,
                  selections: [
                    v3 /*: any*/,
                    v4 /*: any*/,
                    {
                      alias: null,
                      args: null,
                      concreteType: "Planet",
                      kind: "LinkedField",
                      name: "homeworld",
                      plural: false,
                      selections: [v4 /*: any*/],
                      storageKey: null,
                    },
                  ],
                  storageKey: null,
                },
                v5 /*: any*/,
              ],
              storageKey: null,
            },
            v6 /*: any*/,
          ],
          storageKey: null,
        },
      ],
      type: "Root",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: [v1 /*: any*/, v0 /*: any*/],
      kind: "Operation",
      name: "PeopleQuery",
      selections: [
        {
          alias: null,
          args: v2 /*: any*/,
          concreteType: "PeopleConnection",
          kind: "LinkedField",
          name: "allPeople",
          plural: false,
          selections: [
            {
              alias: null,
              args: null,
              concreteType: "PeopleEdge",
              kind: "LinkedField",
              name: "edges",
              plural: true,
              selections: [
                {
                  alias: null,
                  args: null,
                  concreteType: "Person",
                  kind: "LinkedField",
                  name: "node",
                  plural: false,
                  selections: [
                    v3 /*: any*/,
                    v4 /*: any*/,
                    {
                      alias: null,
                      args: null,
                      concreteType: "Planet",
                      kind: "LinkedField",
                      name: "homeworld",
                      plural: false,
                      selections: [v4 /*: any*/, v3 /*: any*/],
                      storageKey: null,
                    },
                  ],
                  storageKey: null,
                },
                v5 /*: any*/,
              ],
              storageKey: null,
            },
            v6 /*: any*/,
          ],
          storageKey: null,
        },
      ],
    },
    params: {
      cacheID: "2d1b59e462e1766b9ca6a91d8b8aa03b",
      id: null,
      metadata: {},
      name: "PeopleQuery",
      operationKind: "query",
      text:
        "query PeopleQuery(\n  $limit: Int = 10\n  $after: String\n) {\n  allPeople(first: $limit, after: $after) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          name\n          id\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n",
    },
  };
})();
(node as any).hash = "0ce6117fdb1b425421ca351ab4df1a54";
(node as any).query =
  "query PeopleQuery(\n  $limit: Int = 10\n  $after: String\n) {\n  allPeople(first: $limit, after: $after) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          name\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n";
export default node;
