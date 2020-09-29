/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type PeopleQueryVariables = {
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
  $after: String
) {
  allPeople(first: 10, after: $after) {
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
  $after: String
) {
  allPeople(first: 10, after: $after) {
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
  var v0 = [
      {
        defaultValue: null,
        kind: "LocalArgument",
        name: "after",
      },
    ],
    v1 = [
      {
        kind: "Variable",
        name: "after",
        variableName: "after",
      },
      {
        kind: "Literal",
        name: "first",
        value: 10,
      },
    ],
    v2 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "id",
      storageKey: null,
    },
    v3 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "name",
      storageKey: null,
    },
    v4 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "cursor",
      storageKey: null,
    },
    v5 = {
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
      argumentDefinitions: v0 /*: any*/,
      kind: "Fragment",
      metadata: null,
      name: "PeopleQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
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
                    v2 /*: any*/,
                    v3 /*: any*/,
                    {
                      alias: null,
                      args: null,
                      concreteType: "Planet",
                      kind: "LinkedField",
                      name: "homeworld",
                      plural: false,
                      selections: [v3 /*: any*/],
                      storageKey: null,
                    },
                  ],
                  storageKey: null,
                },
                v4 /*: any*/,
              ],
              storageKey: null,
            },
            v5 /*: any*/,
          ],
          storageKey: null,
        },
      ],
      type: "Root",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Operation",
      name: "PeopleQuery",
      selections: [
        {
          alias: null,
          args: v1 /*: any*/,
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
                    v2 /*: any*/,
                    v3 /*: any*/,
                    {
                      alias: null,
                      args: null,
                      concreteType: "Planet",
                      kind: "LinkedField",
                      name: "homeworld",
                      plural: false,
                      selections: [v3 /*: any*/, v2 /*: any*/],
                      storageKey: null,
                    },
                  ],
                  storageKey: null,
                },
                v4 /*: any*/,
              ],
              storageKey: null,
            },
            v5 /*: any*/,
          ],
          storageKey: null,
        },
      ],
    },
    params: {
      cacheID: "56f12338bf60c7a8cf0c6ec38f1b0e60",
      id: null,
      metadata: {},
      name: "PeopleQuery",
      operationKind: "query",
      text:
        "query PeopleQuery(\n  $after: String\n) {\n  allPeople(first: 10, after: $after) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          name\n          id\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n",
    },
  };
})();
(node as any).hash = "aa27f4b387789ff53375561295d29a3f";
(node as any).query =
  "query PeopleQuery(\n  $after: String\n) {\n  allPeople(first: 10, after: $after) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          name\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n";
export default node;
