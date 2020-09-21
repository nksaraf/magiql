import { useClient } from "../../hooks";
import { throwError } from "../../utils";
import { Store } from "../types";
import { QueryCache } from "react-query";

export function createQueryCacheStore(
  options: Partial<Store> & {
    cache?: QueryCache;
  } = {}
): () => Store {
  const { cache = new QueryCache() } = options;
  const useFragment = (_, fragmentRef) => fragmentRef;
  const commit = (_operation, _data) => {};
  const useOperation: Store["useOperation"] = (operation) => {
    const client = useClient();
    const queryKey = client.getQueryKey(operation);
    console.log((cache as any).queries);
    console.log(cache.getQuery(queryKey));
    return cache.getQueryData(queryKey);
  };

  const useOperationPages: Store["useOperationPages"] = (operation) => {
    return useOperation(operation);
  };

  const useEntities = () => {
    return [];
  };

  const store: Store = {
    commit,
    useFragment,
    useOperation,
    getDataID: throwError(),
    update: throwError(),
    updateRecord: throwError(),
    get: throwError(),
    useEntities,
    useOperationPages,
  };

  return function useStore() {
    return store;
  };
}
