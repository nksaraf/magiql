import { getFragment, GraphQLTaggedNode } from "../graphql-tag";
import { $Call, KeyType, KeyReturnType } from "../types";
import { useClient } from "./useClient";

export function useFragment<TKey extends KeyType>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TKey
): $Call<KeyReturnType<TKey>> {
  if (typeof fragmentNode === "string") {
    throw new Error("Use Babel plugin");
  }
  const node = getFragment(fragmentNode);
  const client = useClient();
  const store = client.useStore();
  const data = store.useFragment(node, fragmentRef);
  return data;
}
