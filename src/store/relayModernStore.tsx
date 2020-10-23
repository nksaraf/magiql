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
  Snapshot,
} from "../types";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";
import { createStore } from "./cacheStore";

export function createRelayStore({
  environment,
}: {
  environment: RelayModernEnvironment;
}): Store {
  function useSelector<TData>(selector: SingularReaderSelector) {
    const snapshot = (environment
      .getStore()
      .lookup(selector) as unknown) as Snapshot<TData>;
    return snapshot;
  }

  function useEntities() {
    const [entities, setEntities] = React.useState([]);

    React.useEffect(() => {
      const source = environment.getStore().getSource();
      const recordsIds = source.getRecordIDs();
      setEntities([...recordsIds.map((id) => [id, source.get(id)])]);

      //   environment.getStore().
    }, []);

    // entities.forEach((entry: string) => {
    //   data.push([entry, get(entry)]);
    // });
    // const rerender = useRerenderer();

    // React.useEffect(() => {
    //   const sub = cache.subscribe(() => rerender());
    //   return () => {
    //     sub();
    //   };
    // }, [rerender]);

    return entities;
  }

  function useOperationPages<TQuery extends Query>(
    operation: Operation<TQuery>,
    pageVariables: any[]
  ) {
    const seenRecords = new Set();

    // const data = pageVariables.map((variables) => {
    //   const pageOperation = createOperation(operation.request.node, variables);

    //   const data = readFragment<any, object>(reader, pageOperation.fragment, {
    //     onReadRecord: (dataID) => seenRecords.add(dataID),
    //   });

    //   return data;
    // });

    // // @ts-ignore
    // useSubscriptions([...seenRecords.values()]);

    return [];
  }

  return createStore({
    type: "relayStore",
    isNormalized: false,
    update: (recordSource: RecordSource) => {
      //   batchedUpdates(() => {
      //     Object.keys(recordSource).forEach((id) => {
      //       updateRecord(id, recordSource[id]);
      //     });
      //   });
    },
    environment,
    useSelector,
    updateRecord: () => {},
    useOperationPages,
    useFragment: (fragmentNode, fragmentRef) => {
      return useSelector(
        getSelector(fragmentNode, fragmentRef) as SingularReaderSelector
      );
    },
    useOperation: (operation) => {
      return useSelector(operation.fragment);
    },
    useRecords: useEntities,
    get: {} as any,
  });
}
