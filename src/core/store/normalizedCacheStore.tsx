import React from "react";

import { QueryCache } from "react-query";
import { getSelector, getStorageKey, SelectorData } from "relay-runtime";

import { assertBabelPlugin, stableStringify } from "../../utils";
import { useRerenderer } from "../../hooks/useRerenderer";
import { createOperation } from "../operation";
import {
  Response,
  Query,
  constants,
  Store,
  RelayConcreteNode,
  SingularReaderSelector,
  ReaderFragmentSpread,
  ReaderLinkedField,
  ReaderScalarField,
  ReaderSelection,
  ReaderNode,
  Record,
  ReaderSelector,
  QueryObserver,
  RecordSource,
  Operation,
} from "../types";
import { batchedUpdates } from "./batchedUpdates";
import { createRelayNormalizer, defaultGetDataId } from "./relayNormalizer";

export function createReader(get: any) {
  let seenRecords = new Set<string>();
  let selector: any;

  function traverse(node: ReaderNode, dataID: string, prevData: any) {
    // const record: any = source.

    const record = get(dataID);

    if (record == null) {
      // if (record === undefined) {
      //   this._isMissingData = true;
      // }
      return record;
    }
    const data = prevData || {};
    traverseSelections(node.selections, record, data);
    if (
      !(data[constants.FRAGMENT_OWNER_KEY] && Object.keys(data).length === 3)
    ) {
      seenRecords.add(dataID);
    }
    return data;
  }

  function readScalar(field: ReaderScalarField, record: Record, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const value = record[storageKey];
    data[applicationName] = value;
    return value;
  }

  function readPluralLink(field: ReaderLinkedField, record: Record, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    let linkedIDs = record[storageKey];

    if (linkedIDs === undefined) {
      return null;
    }

    linkedIDs = linkedIDs[constants.REFS_KEY];

    if (linkedIDs == null) {
      data[applicationName] = linkedIDs;
      if (linkedIDs === undefined) {
        return null;
      }
      return null;
    }

    // const prevData = data[applicationName];
    // invariant(
    //   prevData == null || Array.isArray(prevData),
    //   "RelayReader(): Expected data for field `%s` on record `%s` " +
    //     "to be an array, got `%s`.",
    //   applicationName,
    //   RelayModernRecord.getDataID(record),
    //   prevData
    // );
    // const linkedArray = prevData || [];
    
    const linkedArray: any[] = [];
    linkedIDs.forEach((linkedID: string, nextIndex: number) => {
      if (linkedID == null) {
        if (linkedID === undefined) {
          // this._isMissingData = true;
        }
        // $FlowFixMe[cannot-write]
        linkedArray[nextIndex] = linkedID;
        return;
      }
      const prevItem = null;
      // linkedArray.push(nextIndex);
      // invariant(
      //   prevItem == null || typeof prevItem === "object",
      //   "RelayReader(): Expected data for field `%s` on record `%s` " +
      //     "to be an object, got `%s`.",
      //   applicationName,
      //   RelayModernRecord.getDataID(record),
      //   prevItem
      // );
      // $FlowFixMe[cannot-write]
      // $FlowFixMe[incompatible-variance]

      linkedArray.push(traverse(field, linkedID, prevItem));
    });
    data[applicationName] = linkedArray;
    return linkedArray;
  }

  function readLink(field: ReaderLinkedField, record: Record, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const linkedID = record[storageKey];
    if (linkedID == null) {
      data[applicationName] = linkedID;
      if (linkedID === undefined) {
        return null;
      }
      return linkedID;
    }

    const prevData = data[applicationName];
    // invariant(
    //   prevData == null || typeof prevData === "object",
    //   "RelayReader(): Expected data for field `%s` on record `%s` " +
    //     "to be an object, got `%s`.",
    //   applicationName,
    //   RelayModernRecord.getDataID(record),
    //   prevData
    // );
    // $FlowFixMe[incompatible-variance]
    const value = traverse(field, linkedID[constants.REF_KEY], prevData);

    data[applicationName] = value;
    return value;
  }

  function createFragmentPointer(
    fragmentSpread: ReaderFragmentSpread,
    record: Record,
    data: SelectorData
  ): void {
    let fragmentPointers: any = data[constants.FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[constants.FRAGMENTS_KEY] = {};
    }

    // invariant(
    //   typeof fragmentPointers === "object" && fragmentPointers != null,
    //   "RelayReader: Expected fragment spread data to be an object, got `%s`.",
    //   fragmentPointers
    // );
    if (data[constants.ID_KEY] == null) {
      data[constants.ID_KEY] = record[constants.ID_KEY];
    }
    // $FlowFixMe[cannot-write] - writing into read-only field
    fragmentPointers[fragmentSpread.name] =
      // fragmentSpread.args
      // ? getArgumentValues(fragmentSpread.args, this._variables)
      // :
      {};

    data[constants.FRAGMENT_OWNER_KEY] = selector.owner;
  }

  function traverseSelections(
    selections: readonly ReaderSelection[],
    record: Record,
    data: SelectorData
  ) {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      switch (selection.kind) {
        case RelayConcreteNode.SCALAR_FIELD:
          readScalar(selection as ReaderScalarField, record, data);
          break;
        case RelayConcreteNode.LINKED_FIELD:
          if ((selection as ReaderLinkedField).plural) {
            readPluralLink(selection as ReaderLinkedField, record, data);
          } else {
            readLink(selection as ReaderLinkedField, record, data);
          }
          break;
        case RelayConcreteNode.FRAGMENT_SPREAD:
          createFragmentPointer(
            selection as ReaderFragmentSpread,
            record,
            data
          );
          break;
      }
    }
  }

  function reset() {
    seenRecords = new Set();
  }

  function read<TData>(reader: SingularReaderSelector) {
    selector = reader;
    const {
      node,
      dataID,
      // isWithinUnmatchedTypeRefinement
    } = selector;
    // const { abstractKey } = node;
    // const record = source.getQueryData(dataID);

    return traverse(node, dataID, null) as TData;
  }

  return { read, reset, seenRecords };
}

export function createNormalizedQueryCacheStore(
  options: Partial<Store> & {
    cache?: QueryCache;
    normalizer?: { normalizeResponse: any };
  } = {}
): () => Store {
  const entities = new Set<string>();

  const {
    getDataID = defaultGetDataId,
    normalizer = createRelayNormalizer({ getDataID }),
    cache = new QueryCache(),
  } = options;

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

    const dataReader = createReader(get);
    const snaphot = dataReader.read<TData>(selector as SingularReaderSelector);
    // @ts-ignore
    useSubscriptions([...dataReader.seenRecords.values()]);

    return snaphot;
  }

  const {
    useFragment = (fragmentNode, fragmentRef) => {
      assertBabelPlugin(fragmentNode);
      return useSelector(getSelector(fragmentNode, fragmentRef));
    },
    useOperation = (operation) => {
      assertBabelPlugin(operation.fragment);
      return useSelector(operation.fragment);
    },
    commit = (operation, data) => {
      assertBabelPlugin(operation.request.node.fragment);
      const recordSource = normalizer.normalizeResponse(
        operation.request.node,
        data,
        operation.root?.variables
      );
      update(recordSource);
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
    assertBabelPlugin(operation.fragment);
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
    getDataID,
    update,
    updateRecord,
    commit,
    useSelector,
    useOperationPages,
    useFragment,
    useOperation,
    useEntities,
    get,
  };

  return function useStore() {
    return store;
  };
}
