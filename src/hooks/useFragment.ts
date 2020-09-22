import { getFragment } from "../core/graphql-tag";
import {
  $Call,
  KeyType,
  KeyReturnType,
  GraphQLTaggedNode,
} from "../core/types";
import { assertBabelPlugin } from "../utils";
import { useStore } from "./useStore";

export function useFragment<TKey extends KeyType>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TKey
): $Call<KeyReturnType<TKey>> {
  assertBabelPlugin(typeof fragmentNode !== "string");
  const node = getFragment(fragmentNode);
  const store = useStore();
  const data = store.useFragment(node as any, fragmentRef);
  return data;
}
