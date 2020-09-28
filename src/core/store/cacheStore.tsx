import { useGraphQLClient } from "../../hooks";
import { throwError } from "../../utils";
import { Store } from "../types";

export function createQueryCacheStore() {
  const useFragment = (_, fragmentRef) => fragmentRef;
  const commit = (_operation, _data) => {};

  const useOperation: Store["useOperation"] = (operation) => {
    const client = useGraphQLClient();
    const queryKey = client.getQueryKey(operation);
    return client.cache.getQueryData(queryKey);
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
    updateRecord: throwError(),
    update: throwError(),
    get: throwError(),
    useEntities,
    useOperationPages,
  };

  function useStore() {
    return store;
  }

  return useStore;
}
