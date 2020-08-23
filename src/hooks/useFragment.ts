import { getFragment, GraphQLTaggedNode } from "../graphql-tag";
import { $Call, KeyType, KeyReturnType } from "../types";
import { useClient } from "./useClient";

export function useFragment<TKey extends KeyType>(
  fragmentNode: GraphQLTaggedNode,
  fragmentRef: TKey
): $Call<KeyReturnType<TKey>> {
  const node = getFragment(fragmentNode);
  const client = useClient();
  const store = client.useStore();
  const snapshot = store.useFragment(node, fragmentRef);

  return snapshot;
}
