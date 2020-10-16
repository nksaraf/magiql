/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type paginatedQueryVariables = {
    limit?: number | null;
};
export type paginatedQueryResponse = {
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
};
export type paginatedQuery = {
    readonly response: paginatedQueryResponse;
    readonly variables: paginatedQueryVariables;
};

/**QUERY**
query paginatedQuery(
  $limit: Int = 10
) {
  allPeople(first: $limit) {
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
query paginatedQuery(
  $limit: Int = 10
) {
  allPeople(first: $limit) {
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
var v0 = [
  {
    "defaultValue": 10,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "limit"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v4 = {
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "paginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "Person_person"
                  }
                ],
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Root",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "paginatedQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Planet",
                    "kind": "LinkedField",
                    "name": "homeworld",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c8d89cb6fda21f601e1a3f6ccac4c7eb",
    "id": null,
    "metadata": {},
    "name": "paginatedQuery",
    "operationKind": "query",
    "text": "query paginatedQuery(\n  $limit: Int = 10\n) {\n  allPeople(first: $limit) {\n    edges {\n      node {\n        id\n        ...Person_person\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n\nfragment Person_person on Person {\n  name\n  homeworld {\n    name\n    id\n  }\n}\n"
  }
};
})();
(node as any).hash = 'f9dac4940f1673805b7573aa077bbe22';
(node as any).query = "query paginatedQuery(\n  $limit: Int = 10\n) {\n  allPeople(first: $limit) {\n    edges {\n      node {\n        id\n        name\n        homeworld {\n          name\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
export default node;
