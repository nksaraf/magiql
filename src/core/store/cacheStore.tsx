import { useGraphQLClient } from "../../hooks/useGraphQLClient";
import { throwError } from "../../utils";
import { Store, UseOperation } from "../types";

export const createStore = (store: Store) => {
  return store;
};

export function createQueryCacheStore(): Store {
  const useOperation: UseOperation = (operation) => {
    const client = useGraphQLClient();
    const queryKey = client.getQueryKey(operation);
    const data = client.cache.getQueryData(queryKey);
    return { data, isMissingData: data ? true : false };
  };

  const store = createStore({
    useFragment: (_, fragmentRef) => fragmentRef as any,
    useOperation,
    updateRecord: throwError(),
    update: (data) => {},
    get: throwError(),
    useRecords: () => {
      return [];
    },
    type: "unnormalized",
    useOperationPages: (operation) => {
      return useOperation(operation) as any;
    },
  });

  return store;
}
