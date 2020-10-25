import { useGraphQLClient } from "../hooks/useGraphQLClient";
import { throwError } from "../utils";
import { Store, UseOperation } from "../types";
import { getSelector, SingularReaderSelector } from "relay-runtime";

export const createStore = (store: Store) => {
  return store;
};

export function createQueryCacheStore(): Store {
  const useOperation: UseOperation = (operation) => {
    const client = useGraphQLClient();
    const queryKey = client.getQueryKey(operation);
    const data: typeof operation["response"] = client.queryCache.getQueryData(
      queryKey
    );
    return {
      data,
      isMissingData: data ? true : false,
      seenRecords: {},
      selector: operation.fragment,
    };
  };

  const store = createStore({
    type: "queryCache",
    useFragment: (fragment, fragmentRef) => ({
      data: fragmentRef as any,
      isMissingData: false,
      seenRecords: {},
      selector: getSelector(fragment, fragmentRef) as SingularReaderSelector,
    }),
    useOperation,
    updateRecord: (data) => {},
    update: (data) => {},
    get: throwError(),
    useRecords: () => {
      return [];
    },
    isNormalized: false,
    useOperationPages: (operation) => {
      return useOperation(operation) as any;
    },
  });

  return store;
}
