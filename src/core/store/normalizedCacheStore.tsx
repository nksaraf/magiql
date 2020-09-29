import React from "react";

import { QueryCache } from "react-query";
import { getSelector } from "relay-runtime";

import { stableStringify } from "../../utils";
import { useRerenderer } from "../../hooks/useRerenderer";
import { createOperation } from "../parser";
import {
  Response,
  Query,
  Store,
  SingularReaderSelector,
  ReaderSelector,
  QueryObserver,
  RecordSource,
  Operation,
} from "../types";
import { batchedUpdates } from "./batchedUpdates";
import { readFragmentAsRecords, createReader } from "../reader";

export function createNormalizedQueryCacheStore(
  options: Partial<Store> & {
    cache?: QueryCache;
  } = {}
): () => Store {
  const entities = new Set<string>();

  const { cache = new QueryCache() } = options;

  const {
    get = (dataID: string) => {
      const queryHash = stableStringify([dataID]);
      const record = (cache as any).queries[queryHash]?.state.data ?? null;
      return record;
    },
    updateRecord = (dataID: string, data: any) => {
      const query = cache.buildQuery(dataID, {
        enabled: false,
      });
      entities.add(dataID);
      query.setData((oldData = {}) => ({
        ...oldData,
        ...data,
      }));
    },
    update = (recordSource: RecordSource) => {
      batchedUpdates(() => {
        Object.keys(recordSource).forEach((id) => {
          updateRecord(id, recordSource[id]);
        });
      });
    },
  } = options;

  function useSubscriptions(dataIDs: string[]) {
    const rerender = useRerenderer();
    const subscribedRecords = React.useMemo(
      () => new Map<string, QueryObserver<Response<Query>, Error>>(),
      []
    );
    const subscribedRecordsRef = React.useRef(subscribedRecords);

    React.useEffect(() => {
      const next = dataIDs;
      //@ts-ignore
      const prev = [...subscribedRecordsRef.current.keys()];
      for (var i = 0; i < prev.length; i++) {
        if (!next.find((id) => id === prev[i])) {
          subscribedRecordsRef.current.get(prev[i])?.unsubscribe();
        }
      }
      for (var i = 0; i < next.length; i++) {
        const recordQuery = cache.buildQuery<any, Error>(next[i] as any, {
          enabled: false,
        });

        if (!subscribedRecordsRef.current.has(next[i])) {
          subscribedRecordsRef.current.set(
            next[i],
            recordQuery.subscribe(() => rerender())
          );
        }
      }
      return () => {
        subscribedRecordsRef.current.forEach((value) => {
          value.unsubscribe();
        });
        subscribedRecordsRef.current.clear();
      };
    }, [dataIDs, rerender]);
  }

  function useSelector<TData>(selector: ReaderSelector) {
    if (!selector) {
      throw new Error("No selector specified");
    }

    const { data, seenRecords } = readFragmentAsRecords(selector, get);
    useSubscriptions([...seenRecords]);

    return data;
  }

  const {
    useFragment = (fragmentNode, fragmentRef) => {
      return useSelector(getSelector(fragmentNode, fragmentRef));
    },
    useOperation = (operation) => {
      return useSelector(operation.fragment);
    },
    commit = (operation, data) => {
      update(data);
    },
  } = options;

  function useEntities() {
    const data: any = [];
    entities.forEach((entry: string) => {
      data.push([entry, get(entry)]);
    });
    const rerender = useRerenderer();

    React.useEffect(() => {
      const sub = cache.subscribe(() => rerender());
      return () => {
        sub();
      };
    }, [rerender]);

    return data;
  }

  function useOperationPages<TQuery extends Query>(
    operation: Operation<TQuery>,
    pageVariables: any[]
  ) {
    const dataReader = createReader(get);

    const data = pageVariables.map((variables) => {
      const pageOperation = createOperation(operation.request.node, variables);

      const snapshot = dataReader.read<Response<TQuery>>(
        pageOperation.fragment as SingularReaderSelector
      );

      return snapshot;
    });

    // @ts-ignore
    useSubscriptions([...dataReader.seenRecords.values()]);

    return data;
  }

  const store = {
    update,
    updateRecord,
    commit,
    useSelector,
    useOperationPages,
    useFragment,
    type: "normalized" as const,
    useOperation,
    useEntities,
    get,
  };

  return function useStore() {
    return store;
  };
}

// class Stttor implements Store {
//   type = "normalized" as const;
//   cache: QueryCache;
//   entities = new Set<string>();

//   constructor({ cache = new QueryCache() }: { cache?: QueryCache }) {
//     this.cache = cache;
//   }

//   update(recordSource: any): void {
//     throw new Error("Method not implemented.");
//   }

//   updateRecord(id: string, record: any): void {
//     throw new Error("Method not implemented.");
//   }
//   get(dataID: string) {
//     throw new Error("Method not implemented.");
//   }
//   commit<TQuery extends Query>(
//     operation: Operation<TQuery>,
//     data: TQuery["response"]
//   ): void {
//     throw new Error("Method not implemented.");
//   }
//   useFragment<TKey extends import("../types").KeyType>(
//     fragmentNode: import("relay-runtime").ReaderFragment,
//     fragmentRef: TKey
//   ): NonNullable<TKey[" $data"]> {
//     throw new Error("Method not implemented.");
//   }
//   useOperation<TQuery extends Query>(
//     operation: Operation<TQuery>
//   ): TQuery["response"] {
//     throw new Error("Method not implemented.");
//   }
//   useEntities(): [string, { [key: string]: any }][] {
//     const data: any = [];
//     this.entities.forEach((entry: string) => {
//       data.push([entry, this.get(entry)]);
//     });
//     const rerender = useRerenderer();

//     React.useEffect(() => {
//       const sub = this.cache.subscribe(() => rerender());
//       return () => {
//         sub();
//       };
//     }, [rerender]);

//     return data;
//   }
//   useOperationPages<TQuery extends Query>(
//     operation: Operation<TQuery>,
//     pageVariables: any[]
//   ): TQuery["response"][] {
//     const dataReader = createReader(this.get);

//     const data = pageVariables.map((variables) => {
//       const pageOperation = createOperation(operation.request.node, variables);

//       const snapshot = dataReader.read<Response<TQuery>>(
//         pageOperation.fragment as SingularReaderSelector
//       );

//       return snapshot;
//     });

//     // @ts-ignore
//     useSubscriptions([...dataReader.seenRecords.values()]);

//     return data;
//   }
//   Provider?: React.FC<{ children: React.ReactNode }>;
// }
