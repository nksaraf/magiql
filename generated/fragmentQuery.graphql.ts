/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type fragmentQueryVariables = {};
export type fragmentQueryResponse = {
  readonly allFilms: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly title: string | null;
        readonly " $fragmentRefs": FragmentRefs<"Film_film">;
      } | null;
    } | null> | null;
  } | null;
};
export type fragmentQuery = {
  readonly response: fragmentQueryResponse;
  readonly variables: fragmentQueryVariables;
};

/**QUERY**
query fragmentQuery {
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
query fragmentQuery {
  allFilms {
    edges {
      node {
        id
        title
        ...Film_film
      }
    }
  }
}

fragment Film_film on Film {
  id
  title
}
*/

const node: ConcreteRequest = (function () {
  var v0 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "id",
      storageKey: null,
    },
    v1 = {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "title",
      storageKey: null,
    };
  return {
    fragment: {
      argumentDefinitions: [],
      kind: "Fragment",
      metadata: null,
      name: "fragmentQuery",
      selections: [
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
                    v0 /*: any*/,
                    v1 /*: any*/,
                    {
                      args: null,
                      kind: "FragmentSpread",
                      name: "Film_film",
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
      ],
      type: "Root",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: [],
      kind: "Operation",
      name: "fragmentQuery",
      selections: [
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
                  selections: [v0 /*: any*/, v1 /*: any*/],
                  storageKey: null,
                },
              ],
              storageKey: null,
            },
          ],
          storageKey: null,
        },
      ],
    },
    params: {
      cacheID: "6573231730c75e0a03d566c429a8b6fb",
      id: null,
      metadata: {},
      name: "fragmentQuery",
      operationKind: "query",
      text:
        "query fragmentQuery {\n  allFilms {\n    edges {\n      node {\n        id\n        title\n      }\n    }\n  }\n}\n",
    },
  };
})();
(node as any).hash = "61f4bba8385200d01537292ba30d38ec";
export default node;
