/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type community_types_enum = "COURSE" | "PROFESSIONAL_AREA" | "SUBJECT_AREA" | "%future added value";
export type ListItem_community$data = {
    readonly communityId: number;
    readonly community: {
        readonly communityType: community_types_enum;
    };
    readonly " $refType": "ListItem_community";
};
export type ListItem_community = {
    readonly " $data"?: ListItem_community$data;
    readonly " $fragmentRefs": FragmentRefs<"ListItem_community">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListItem_community",
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
  "type": "community_posts",
  "abstractKey": null
};
(node as any).hash = '734da17d1fabc66131c5468b1da9a345';

export default node;
