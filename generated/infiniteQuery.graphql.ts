/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type infiniteQueryVariables = {
    limit?: number | null;
    after?: string | null;
};
export type infiniteQueryResponse = {
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
export type infiniteQuery = {
    readonly response: infiniteQueryResponse;
    readonly variables: infiniteQueryVariables;
};

/**QUERY**
query infiniteQuery(
  $limit: Int = 10
  $after: String = "YXJyYXljb25uZWN0aW9uOjk="
) {
  allPeople(first: $limit, after: $after) {
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
query infiniteQuery(
  $limit: Int = 10
  $after: String = "YXJyYXljb25uZWN0aW9uOjk="
) {
  allPeople(first: $limit, after: $after) {
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

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": "YXJyYXljb25uZWN0aW9uOjk=",
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": 10,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "limit"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "Planet",
  "kind": "LinkedField",
  "name": "homeworld",
  "plural": false,
  "selections": [
    (v3/*: any*/),
    (v4/*: any*/)
  ],
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "FilmsConnection",
  "kind": "LinkedField",
  "name": "allFilms",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "FilmsEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Film",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v3/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "infiniteQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "PeopleConnection",
        "kind": "LinkedField",
        "name": "allPeople",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PeopleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Person",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "Person_person"
                  }
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      },
      (v8/*: any*/)
    ],
    "type": "Root",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "infiniteQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "PeopleConnection",
        "kind": "LinkedField",
        "name": "allPeople",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PeopleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Person",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      },
      (v8/*: any*/)
    ]
  },
  "params": {
    "cacheID": "644e3e1c8993e65190b88b6c11aa4f7a",
    "id": null,
    "metadata": {},
    "name": "infiniteQuery",
    "operationKind": "query",
    "text": "query infiniteQuery(\n  $limit: Int = 10\n  $after: String = \"YXJyYXljb25uZWN0aW9uOjk=\"\n) {\n  allPeople(first: $limit, after: $after) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          id\n          name\n        }\n        ...Person_person\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  allFilms {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n\nfragment Person_person on Person {\n  name\n  homeworld {\n    name\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = '6652cd1a8bd4961d4ffc76a667262e60';
(node as any).query = "query infiniteQuery(\n  $limit: Int = 10\n  $after: String = \"YXJyYXljb25uZWN0aW9uOjk=\"\n) {\n  allPeople(first: $limit, after: $after) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          id\n          name\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n  allFilms {\n    edges {\n      node {\n        id\n      }\n    }\n  }\n}\n"
export default node;
