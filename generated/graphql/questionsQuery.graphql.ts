/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type questionsQueryVariables = {
    limit?: number | null;
    createdAt?: unknown | null;
};
export type questionsQueryResponse = {
    readonly posts: ReadonlyArray<{
        readonly createdAt: unknown;
        readonly answer: {
            readonly body: string;
        } | null;
        readonly " $fragmentRefs": FragmentRefs<"People_person">;
    }>;
};
export type questionsQuery = {
    readonly response: questionsQueryResponse;
    readonly variables: questionsQueryVariables;
};

/**QUERY**
query questionsQuery(
  $limit: Int = 10
  $createdAt: timestamptz = "now()"
) {
  posts(limit: $limit, where: {createdAt: {_lt: $createdAt}}, order_by: {createdAt: desc}) {
    postId
    createdAt
    answer {
      answerId
      body
    }
    postType
    communities {
      postId
      communityId
      community {
        communityId
        communityType
      }
    }
    question {
      questionId
      body
    }
  }
}
****/


/*
query questionsQuery(
  $limit: Int = 10
  $createdAt: timestamptz = "now()"
) {
  posts(limit: $limit, where: {createdAt: {_lt: $createdAt}}, order_by: {createdAt: desc}) {
    createdAt
    answer {
      body
    }
    ...People_person
  }
}

fragment ListItem_community on community_posts {
  communityId
  community {
    communityType
  }
}

fragment People_person on posts {
  postType
  communities {
    ...ListItem_community
  }
  question {
    body
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": "now()",
  "kind": "LocalArgument",
  "name": "createdAt"
},
v1 = {
  "defaultValue": 10,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Literal",
    "name": "order_by",
    "value": {
      "createdAt": "desc"
    }
  },
  {
    "fields": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "_lt",
            "variableName": "createdAt"
          }
        ],
        "kind": "ObjectValue",
        "name": "createdAt"
      }
    ],
    "kind": "ObjectValue",
    "name": "where"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "body",
    "storageKey": null
  }
],
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "answers",
  "kind": "LinkedField",
  "name": "answer",
  "plural": false,
  "selections": (v4/*: any*/),
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
    "name": "questionsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "posts",
        "kind": "LinkedField",
        "name": "posts",
        "plural": true,
        "selections": [
          (v3/*: any*/),
          (v5/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "People_person"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "query_root",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "questionsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "posts",
        "kind": "LinkedField",
        "name": "posts",
        "plural": true,
        "selections": [
          (v3/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "postType",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "community_posts",
            "kind": "LinkedField",
            "name": "communities",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "communityId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "communities",
                "kind": "LinkedField",
                "name": "community",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "communityType",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "questions",
            "kind": "LinkedField",
            "name": "question",
            "plural": false,
            "selections": (v4/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0ee7ec7b71b99448e02ced86239a8740",
    "id": null,
    "metadata": {},
    "name": "questionsQuery",
    "operationKind": "query",
    "text": "query questionsQuery(\n  $limit: Int = 10\n  $createdAt: timestamptz = \"now()\"\n) {\n  posts(limit: $limit, where: {createdAt: {_lt: $createdAt}}, order_by: {createdAt: desc}) {\n    createdAt\n    answer {\n      body\n    }\n    ...People_person\n  }\n}\n\nfragment ListItem_community on community_posts {\n  communityId\n  community {\n    communityType\n  }\n}\n\nfragment People_person on posts {\n  postType\n  communities {\n    ...ListItem_community\n  }\n  question {\n    body\n  }\n}\n"
  }
};
})();
(node as any).hash = 'e5ccc846341f9b85c05391470ca631a5';
(node as any).query = "query questionsQuery(\n  $limit: Int = 10\n  $createdAt: timestamptz = \"now()\"\n) {\n  posts(limit: $limit, where: {createdAt: {_lt: $createdAt}}, order_by: {createdAt: desc}) {\n    postId\n    createdAt\n    answer {\n      answerId\n      body\n    }\n    postType\n    communities {\n      postId\n      communityId\n      community {\n        communityId\n        communityType\n      }\n    }\n    question {\n      questionId\n      body\n    }\n  }\n}\n"
export default node;
