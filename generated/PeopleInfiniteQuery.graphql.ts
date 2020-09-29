/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type PeopleInfiniteQueryVariables = {
  limit?: number | null;
};
export type PeopleInfiniteQueryResponse = {
  readonly allPeople: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null;
        readonly homeworld: {
          readonly id: string;
          readonly name: string | null;
        } | null;
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
) {
  allPeople(first: $limit) {
    edges {
      node {
        id
        name
        homeworld {
          id
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
) {
  allPeople(first: $limit) {
    edges {
      node {
        id
        name
        homeworld {
          id
          name
        }
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
  var v0 = [
      {
        defaultValue: 10,
        kind: "LocalArgument",
        name: "limit",
      },
    ],
    v1 = [
      {
        kind: "Variable",
        name: "first",
        variableName: "limit",
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
      concreteType: "Planet",
      kind: "LinkedField",
      name: "homeworld",
      plural: false,
      selections: [v2 /*: any*/, v3 /*: any*/],
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
    },
    v7 = {
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
              selections: [v2 /*: any*/],
              storageKey: null,
            },
          ],
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
      name: "PeopleInfiniteQuery",
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
                    v4 /*: any*/,
                    {
                      args: null,
                      kind: "FragmentSpread",
                      name: "Person_person",
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
        v7 /*: any*/,
      ],
      type: "Root",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: v0 /*: any*/,
      kind: "Operation",
      name: "PeopleInfiniteQuery",
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
                  selections: [v2 /*: any*/, v3 /*: any*/, v4 /*: any*/],
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
        v7 /*: any*/,
      ],
    },
    params: {
      cacheID: "73fc9e095d2366260bf669927378bfc0",
      id: null,
      metadata: {},
      name: "PeopleInfiniteQuery",
      operationKind: "query",
      text:
        "query PeopleInfiniteQuery(\n  $limit: Int = 10\n) {\n  allPeople(first: $limit) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          id\n          name\n        }\n        ...Person_person\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  allFilms {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n\nfragment Person_person on Person {\n  name\n  homeworld {\n    name\n    id\n  }\n}\n",
    },
  };
})();
(node as any).hash = "56bdfec7952ff91f9317bfcabc26b533";
(node as any).query =
  "query PeopleInfiniteQuery(\n  $limit: Int = 10\n) {\n  allPeople(first: $limit) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          id\n          name\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  allFilms {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n";
export default node;
