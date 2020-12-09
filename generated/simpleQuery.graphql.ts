/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type simpleQueryVariables = {};
export type simpleQueryResponse = {
  readonly allFilms: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly title: string | null;
      } | null;
    } | null> | null;
  } | null;
};
export type simpleQuery = {
  readonly response: simpleQueryResponse;
  readonly variables: simpleQueryVariables;
};

/**QUERY**
query simpleQuery {
  allFilms {
    edges {
      node {
        id
        title
      }
    }
  }
}
****/

/*
query simpleQuery {
  allFilms {
    edges {
      node {
        id
        title
      }
    }
  }
}
*/

const node: ConcreteRequest = (function () {
  var v0 = [
    {
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
              selections: [
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "id",
                  storageKey: null,
                },
                {
                  alias: null,
                  args: null,
                  kind: "ScalarField",
                  name: "title",
                  storageKey: null,
                },
              ],
              storageKey: null,
            },
          ],
          storageKey: null,
        },
      ],
      storageKey: null,
    },
  ];
  return {
    fragment: {
      argumentDefinitions: [],
      kind: "Fragment",
      metadata: null,
      name: "simpleQuery",
      selections: v0 /*: any*/,
      type: "Root",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: [],
      kind: "Operation",
      name: "simpleQuery",
      selections: v0 /*: any*/,
    },
    params: {
      cacheID: "2be445ecddf21ce2ed27ed551312534c",
      id: null,
      metadata: {},
      name: "simpleQuery",
      operationKind: "query",
      text:
        "query simpleQuery {\n  allFilms {\n    edges {\n      node {\n        id\n        title\n      }\n    }\n  }\n}\n",
    },
  };
})();
(node as any).hash = "bbc3d5b907f9c484c047ad7f5fb2efae";
(node as any).query =
  "query simpleQuery {\n  allFilms {\n    edges {\n      node {\n        id\n        title\n      }\n    }\n  }\n}\n";
export default node;
