/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type Film_film$data = {
  readonly id: string;
  readonly title: string | null;
  readonly " $refType": "Film_film";
};
export type Film_film = {
  readonly " $data"?: Film_film$data;
  readonly " $fragmentRefs": FragmentRefs<"Film_film">;
};

const node: ReaderFragment = {
  argumentDefinitions: [],
  kind: "Fragment",
  metadata: null,
  name: "Film_film",
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
  type: "Film",
  abstractKey: null,
};
(node as any).hash = "d671945bcd6a86036ffe29e8d77f34da";
export default node;
