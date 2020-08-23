/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type post_types_enum = "ANNOUNCEMENT" | "ANSWER" | "QUESTION" | "UPLOAD" | "%future added value";
export type People_person$data = {
    readonly postId: number;
    readonly postType: post_types_enum;
    readonly communities: ReadonlyArray<{
        readonly " $fragmentRefs": FragmentRefs<"ListItem_community">;
    }>;
    readonly question: {
        readonly questionId: number;
        readonly body: string;
    } | null;
    readonly " $refType": "People_person";
};
export type People_person = {
    readonly " $data"?: People_person$data;
    readonly " $fragmentRefs": FragmentRefs<"People_person">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "People_person",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "postId",
      "storageKey": null
    },
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "ListItem_community"
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
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "questionId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "body",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "posts",
  "abstractKey": null
};
(node as any).hash = 'ced6a4b5e7e841f3f49d9f2cf90b8202';

export default node;
