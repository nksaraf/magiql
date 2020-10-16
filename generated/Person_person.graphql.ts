/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type Person_person$data = {
    readonly name: string | null;
    readonly homeworld: {
        readonly name: string | null;
    } | null;
    readonly " $refType": "Person_person";
};
export type Person_person = {
    readonly " $data"?: Person_person$data;
    readonly " $fragmentRefs": FragmentRefs<"Person_person">;
};



const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Person_person",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Planet",
      "kind": "LinkedField",
      "name": "homeworld",
      "plural": false,
      "selections": [
        (v0/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Person",
  "abstractKey": null
};
})();
(node as any).hash = '3ae7c29bfd6751287cfb5d0b4f210011';

export default node;
