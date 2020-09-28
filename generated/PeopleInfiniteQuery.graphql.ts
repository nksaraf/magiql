/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type PeopleInfiniteQueryVariables = {
  limit?: number | null;
  after?: string | null;
};
export type PeopleInfiniteQueryResponse = {
  readonly allPeople: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentRefs": FragmentRefs<"Person_person">;
      } | null;
      readonly cursor: string;
    } | null> | null;
    readonly pageInfo: {
      readonly hasNextPage: boolean;
      readonly endCursor: string | null;
    };
  } | null;
  readonly allFilms: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
      } | null;
    } | null> | null;
  } | null;
};
export type PeopleInfiniteQuery = {
  readonly response: PeopleInfiniteQueryResponse;
  readonly variables: PeopleInfiniteQueryVariables;
};

/**QUERY**
query PeopleInfiniteQuery(
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
  allFilms {
    edges {
      node {
        id
      }
    }
  }
}
****/

/*
query PeopleInfiniteQuery(
  $limit: Int = 10
  $after: String
) {
  allPeople(first: $limit, after: $after) {
    edges {
      node {
        id
        ...Person_person
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
  allFilms {
    edges {
      node {
        id
      }
    }
  }
}

fragment Person_person on Person {
  name
  homeworld {
    name
    id
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
    },
    v6 = {
      alias: null,
      args: null,
      concreteType: "FilmsConnection",
      kind: "LinkedField",
      name: "allFilms",
      plural: false,
      selections: [
        {
          alias: null,
          args: null,
          concreteType: "FilmsEdge",
          kind: "LinkedField",
          name: "edges",
          plural: true,
          selections: [
            {
              alias: null,
              args: null,
              concreteType: "Film",
              kind: "LinkedField",
              name: "node",
              plural: false,
              selections: [v3 /*: any*/],
              storageKey: null,
            },
          ],
          storageKey: null,
        },
      ],
      storageKey: null,
    },
    v7 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "name",
      storageKey: null,
    };
  return {
    fragment: {
      argumentDefinitions: [v0 /*: any*/, v1 /*: any*/],
      kind: "Fragment",
      metadata: null,
      name: "PeopleInfiniteQuery",
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
                    {
                      args: null,
                      kind: "FragmentSpread",
                      name: "Person_person",
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
        v6 /*: any*/,
      ],
      type: "Root",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: [v1 /*: any*/, v0 /*: any*/],
      kind: "Operation",
      name: "PeopleInfiniteQuery",
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
                    v7 /*: any*/,
                    {
                      alias: null,
                      args: null,
                      concreteType: "Planet",
                      kind: "LinkedField",
                      name: "homeworld",
                      plural: false,
                      selections: [v7 /*: any*/, v3 /*: any*/],
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
        v6 /*: any*/,
      ],
    },
    params: {
      cacheID: "24eb9c96ec085b1235e903105f2307ff",
      id: null,
      metadata: {},
      name: "PeopleInfiniteQuery",
      operationKind: "query",
      text:
        "query PeopleInfiniteQuery(\n  $limit: Int = 10\n  $after: String\n) {\n  allPeople(first: $limit, after: $after) {\n    edges {\n      node {\n        id\n        ...Person_person\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  allFilms {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n\nfragment Person_person on Person {\n  name\n  homeworld {\n    name\n    id\n  }\n}\n",
    },
  };
})();
(node as any).hash = "e8b6434abadf195bb9a63f8449eb6172";
(node as any).query =
  "query PeopleInfiniteQuery(\n  $limit: Int = 10\n  $after: String\n) {\n  allPeople(first: $limit, after: $after) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          name\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  allFilms {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n";
export default node;
