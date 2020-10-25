import React from "react";

import { QueryCache } from "react-query";
import { getSelector } from "relay-runtime/lib/store/RelayModernSelector";

import { stableStringify } from "../utils/stringify";
import { useRerenderer } from "../hooks/useRerenderer";
import { createOperation } from "../operation/operation";
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
import { batchedUpdates } from "../utils/batchedUpdates";
import { createRecordReader, readFragment } from "../operation/reader";
import { createStore } from "./query-cache";

export function createNormalizedQueryCacheStore(
  options: Partial<Store> & {
    cache?: QueryCache;
  } = {}
): Store {
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

  const reader = createRecordReader(get);

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
    const seenRecords = new Set();
    const snapshot = readFragment<TData, object>(
      reader,
      selector as SingularReaderSelector,
      {
        onReadRecord: (dataID) => seenRecords.add(dataID),
      }
    );

    // @ts-ignore
    useSubscriptions([...seenRecords.values()]);

    return snapshot;
  }

  return createStore({
    isNormalized: true,
    type: "normalizedCacheStore",
    update,
    updateRecord,
    useOperationPages: (operation, pageVariables) => {
      const seenRecords = new Set();

      const snapshots = pageVariables.map((variables) => {
        const pageOperation = createOperation(
          operation.request.node,
          variables
        );

        return readFragment<any, object>(reader, pageOperation.fragment, {
          onReadRecord: (dataID) => seenRecords.add(dataID),
        });
      });

      // @ts-ignore
      useSubscriptions([...seenRecords.values()]);

      return snapshots;
    },
    useFragment: (fragmentNode, fragmentRef) => {
      return useSelector(getSelector(fragmentNode, fragmentRef));
    },
    useOperation: (operation) => {
      return useSelector(operation.fragment);
    },
    useRecords: () => {
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
    },
    get,
  });
}
