import { getFragment } from "../operation/descriptor";
import {
  $Call,
  KeyType,
  KeyReturnType,
  GraphQLTaggedNode,
} from "../types";
import { assertBabelPlugin } from "../utils";
import { useGraphQLStore } from "./useGraphQLStore";

export function useFragment<TKey extends KeyType>(
  fragmentNode: GraphQLTaggedNode | string,
  fragmentRef: TKey
): $Call<KeyReturnType<TKey>> {
  const node = getFragment(fragmentNode);
  const store = useGraphQLStore();
  const data = store.useFragment(node as any, fragmentRef);
  return data;
}
