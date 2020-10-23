import { useGraphQLClient } from "../../hooks/useGraphQLClient";
import { throwError } from "../../utils";
import { Store } from "../types";

export function createQueryCacheStore() {
  const useFragment = (_, fragmentRef) => fragmentRef;

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
    useFragment,
    useOperation,
    updateRecord: throwError(),
    update: (data) => {},
    get: throwError(),
    useEntities,
    type: "unnormalized",
    useOperationPages,
  };

  function useStore() {
    return store;
  }

  return useStore;
}

class CacheStore implements Store {
  type = "unnormalized" as const;
  useFragment = (_, fragmentRef) => fragmentRef;
  useOperation(operation) {
    const client = useGraphQLClient();
    const queryKey = client.getQueryKey(operation);
    return client.cache.getQueryData(queryKey);
  }

  // updateRecord = {}
  // update: (data) => {} = {}
  // get: throwError() = {}
  // useEntities = {}
  // type: "unnormalized" = {}
  useOperationPages(operation, pageVariables) {
    return this.useOperation(operation);
  }
}
