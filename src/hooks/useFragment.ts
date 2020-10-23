import { getFragment } from "../operation/operation";
import { $Call, KeyType, KeyReturnType, GraphQLTaggedNode } from "../types";
import { useGraphQLClient } from "./useGraphQLClient";

export function useFragment<TKey extends KeyType>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TKey
): $Call<KeyReturnType<TKey>> {
  const node = getFragment(fragmentNode);
  const client = useGraphQLClient();
  const { data } = client.store.useFragment(node, fragmentRef);
  return data;
}
