import { getFragment } from "../operation/operation";
import { $Call, KeyType, KeyReturnType, GraphQLTaggedNode } from "../types";
import { useGraphQLClient } from "./useGraphQLClient";

export function useFragment<TKey extends KeyType | KeyType[]>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TKey
): TKey extends KeyType[]
  ? $Call<KeyReturnType<TKey[0]>>[]
  : TKey extends KeyType
  ? $Call<KeyReturnType<TKey>>
  : null {
  const node = getFragment(fragmentNode);
  const client = useGraphQLClient();
  const { data, isMissingData } = client.store.useFragment(node, fragmentRef);
  return isMissingData ? null : (data as any);
}
