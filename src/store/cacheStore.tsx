import { queryCache } from "react-query";

import { useClient } from "../hooks";
import { Store, QueryCache } from "../types";
import { throwError } from "../utils";

export function createQueryCacheStore(
  options: Partial<Store> & {
    cache?: QueryCache;
  } = {}
): () => Store {
  const {
    cache = queryCache,
    useFragment = (fragmentNode, fragmentRef) => fragmentRef as any,
    commit = (operation, data) => {},
  } = options;

  const useOperation: Store["useOperation"] = (operation) => {
    const client = useClient();
    const queryKey = client.getQueryKey(operation);
    const query = cache.buildQuery(queryKey);
    return query.state.data;
  };

  const useOperationPages: Store["useOperationPages"] = (operation) => {
    return useOperation(operation);
  };

  const useEntities = () => {
    return {};
  };

  const store = {
    commit,
    useFragment,
    useOperation,
    getDataID: throwError(),
    update: throwError(),
    updateRecord: throwError(),
    useSelector: throwError(),
    ref: throwError(),
    get: throwError(),
    refs: throwError(),
    useEntities,
    useOperationPages,
  };

  return function useStore() {
    return store;
  };
}
