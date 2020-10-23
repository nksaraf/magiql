import { getFragment } from "../core/operation/operation";
import {
  $Call,
  KeyType,
  KeyReturnType,
  GraphQLTaggedNode,
} from "../core/types";
import { useGraphQLStore } from "./useGraphQLStore";

export function useFragment<TKey extends KeyType>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TKey
): $Call<KeyReturnType<TKey>> {
  const node = getFragment(fragmentNode);
  const store = useGraphQLStore();
  const data = store.useFragment(node, fragmentRef);
  return data;
}
