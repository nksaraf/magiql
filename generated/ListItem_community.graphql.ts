/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type community_types_enum = "COURSE" | "PROFESSIONAL_AREA" | "SUBJECT_AREA" | "%future added value";
export type ListItem_community$data = {
    readonly communityId: number;
    readonly postId: number;
    readonly community: {
        readonly communityId: number;
        readonly communityType: community_types_enum;
    };
    readonly " $refType": "ListItem_community";
};
export type ListItem_community = {
    readonly " $data"?: ListItem_community$data;
    readonly " $fragmentRefs": FragmentRefs<"ListItem_community">;
};



const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "communityId",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListItem_community",
  "selections": [
    (v0/*: any*/),
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
      "concreteType": "communities",
      "kind": "LinkedField",
      "name": "community",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
  "type": "community_posts",
  "abstractKey": null
};
})();
(node as any).hash = '62be2cd882ac44f0038abf35e0f1b71b';

export default node;
