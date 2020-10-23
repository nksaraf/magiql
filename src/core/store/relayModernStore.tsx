import React from "react";

import { QueryCache } from "react-query";
import { getSelector } from "relay-runtime/lib/store/RelayModernSelector";

import { stableStringify } from "../../utils";
import { useRerenderer } from "../../hooks/useRerenderer";
import { createOperation } from "../operation";
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
import { createRecordReader, readFragment } from "../reader";
import RelayModernStore from "relay-runtime/lib/store/RelayModernStore";
import { useEnvironment } from "../EnvironmentContext";

export function createRelayStore(): () => Store {
  function useSelector<TData>(selector: SingularReaderSelector) {
    const environment = useEnvironment();
    const snapshot = environment.getStore().lookup(selector);
    return (snapshot.data as unknown) as TData;
  }

  const useFragment = (fragmentNode, fragmentRef) => {
    return useSelector(
      getSelector(fragmentNode, fragmentRef) as SingularReaderSelector
    );
  };
  const useOperation = (operation) => {
    return useSelector(operation.fragment);
  };

  function useEntities() {
    const environment = useEnvironment();
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

  const store = {
    update: (recordSource: RecordSource) => {
      return;
      //   batchedUpdates(() => {
      //     Object.keys(recordSource).forEach((id) => {
      //       updateRecord(id, recordSource[id]);
      //     });
      //   });
    },
    updateRecord: {} as any,
    useSelector,
    useOperationPages,
    useFragment,
    useOperation,
    useEntities,
    get: {} as any,
  };

  return function useStore() {
    return store;
  };
}
