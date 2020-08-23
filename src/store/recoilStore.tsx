import React from "react";
import { stableStringify } from "react-query";
import {
  atom,
  ReadWriteSelectorOptions,
  RecoilState,
  selector,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";
import {
  getSelector,
  getStorageKey,
  RelayConcreteNode,
  SelectorData,
  SingularReaderSelector,
} from "relay-runtime";

import { createOperation } from "../graphql-tag";
import {
  OperationDescriptor,
  Query,
  Response,
  constants,
  Store,
  ReaderSelector,
  ReaderNode,
  RecordSource,
  ReaderFragmentSpread,
  ReaderLinkedField,
  ReaderScalarField,
  ReaderSelection,
} from "../types";
import { throwError } from "../utils";
import { createRelayNormalizer } from "./relayNormalizer";

function atomFamily<T, TParam>({
  default: defaultValue,
  key: rootKey,
}: {
  default: T;
  key: (param: TParam) => string;
}) {
  const atomCache: { [key: string]: RecoilState<T> } = {};
  return Object.assign(
    (param: TParam) => {
      const key = rootKey(param);
      const cachedAtom = atomCache[key];
      if (cachedAtom != null) {
        return cachedAtom;
      }

      const newAtom = atom<T>({
        key: rootKey(param),
        default: defaultValue,
      });

      atomCache[key] = newAtom;
      return newAtom;
    },
    {
      cache: atomCache,
    }
  );
}

function selectorFamily<T, TParam>({
  key: rootKey,
  get,
  set,
}: {
  key: (param: TParam) => string;
  get: (param: TParam) => ReadWriteSelectorOptions<T>["get"];
  set?: (param: TParam) => ReadWriteSelectorOptions<T>["set"];
}) {
  const atomCache: { [key: string]: RecoilState<T> } = {};
  return Object.assign(
    (param: TParam) => {
      const key = rootKey(param);
      const cachedAtom = atomCache[key];
      if (cachedAtom != null) {
        return cachedAtom;
      }

      const newAtom = selector<T>({
        key: rootKey(param),
        get: get(param),
        ...(set ? { set: set(param) } : {}),
      }) as any;

      atomCache[key] = newAtom;
      return newAtom;
    },
    {
      cache: atomCache,
    }
  );
}

export const recordField = atomFamily<any, { id: string; field: string }>({
  default: null,
  key: ({ id, field }) => `${id}/${field}`,
});

export const recordRoot = atomFamily<any, string>({
  default: null,
  key: (id) => `${id}`,
});

export const record = selectorFamily<any, any>({
  key: (param) => `record/${param}`,
  get: () => () => null as any,
  set: (param) => ({ set, get }, recordSource) => {
    if (!get(recordRoot(param))) {
      set(recordRoot(param), true);
    }
    for (var i in recordSource) {
      set(recordField({ id: param, field: i }), recordSource[i]);
    }
  },
});

export const fragmentSelector = selectorFamily<any, any>({
  key: (param) => `fragment/${stableStringify(param)}`,
  get: (fragment) => ({ get }) => {
    return readFromRecoil(get, fragment);
  },
});

export const fragmentPagesSelector = selectorFamily<any, any>({
  key: (param) => `fragment/${stableStringify(param)}`,
  get: ([node, pageVariables]) => ({ get }) => {
    return pageVariables.map((page: any) =>
      readFromRecoil(get, createOperation(node, page).fragment)
    );
  },
});

export const storeAtom = selector({
  key: "store",
  get: ({ get }) => {
    const data: any = {};
    Object.entries(recordField.cache)
      .map(([key, val]) => [key, get(val)])
      .forEach((d: any) => {
        const keys: string[] = d[0].split("/");
        let ref = data;
        for (var i of keys.slice(0, keys.length - 1)) {
          if (!ref[i]) {
            ref[i] = {};
          }
          ref = ref[i];
        }
        ref[keys[keys.length - 1]] =
          // typeof d[1] === "object"
          //   ? d[1][constants.REF_KEY] ?? d[1][constants.REFS_KEY]
          // :
          d[1];
      });
    return data;
  },
  set: () => {},
});

export const storeUpdater = selector({
  key: "storeUpdater",
  get: () => null as any,
  set: ({ set }, recordSource) => {
    set(storeAtom, null);
    for (var i in recordSource) {
      set(record(i), recordSource[i]);
    }
  },
});

export function readFromRecoil<TData>(
  getter: any,
  selector: SingularReaderSelector
) {
  function traverse(node: ReaderNode, dataID: string, prevData: any) {
    // const record: any = source.

    // let record = getter(recordRoot(dataID));

    // if (record == null) {
    //   // if (record === undefined) {
    //   //   this._isMissingData = true;
    //   // }
    //   return null;
    // }
    const data = prevData || {};
    traverseSelections(node.selections, dataID, data);

    return data;
  }

  function readScalar(field: ReaderScalarField, dataID: string, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const value = getter(recordField({ id: dataID, field: storageKey }));
    data[applicationName] = value;
    return value;
  }

  function readPluralLink(field: ReaderLinkedField, dataID: string, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);
    const value = getter(recordField({ id: dataID, field: storageKey }));
    if (value === null) {
      return null;
    }

    const linkedIDs = value[constants.REFS_KEY];

    if (linkedIDs == null) {
      data[applicationName] = linkedIDs;
      if (linkedIDs === undefined) {
        return null;
      }
      return linkedIDs;
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
        linkedArray.push(null);
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

  function readLink(field: ReaderLinkedField, dataID: string, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);

    const linkedID = getter(recordField({ id: dataID, field: storageKey }));
    if (storageKey === "subjectArea") {
      console.log(dataID, storageKey, linkedID);
    }
    // console.log(storageKey, selector.variables);
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
    dataID: string,
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
      data[constants.ID_KEY] = dataID;
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
    dataID: string,
    data: SelectorData
  ) {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      switch (selection.kind) {
        case RelayConcreteNode.SCALAR_FIELD:
          readScalar(selection as ReaderScalarField, dataID, data);
          break;
        case RelayConcreteNode.LINKED_FIELD:
          if ((selection as ReaderLinkedField).plural) {
            readPluralLink(selection as ReaderLinkedField, dataID, data);
          } else {
            readLink(selection as ReaderLinkedField, dataID, data);
          }
          break;
        case RelayConcreteNode.FRAGMENT_SPREAD:
          createFragmentPointer(
            selection as ReaderFragmentSpread,
            dataID,
            data
          );
          break;
      }
    }
  }

  const {
    node,
    dataID,
    // isWithinUnmatchedTypeRefinement
  } = selector;
  // const { abstractKey } = node;
  // const record = source.getQueryData(dataID);

  return traverse(node, dataID, null) as TData;
}

export function createRecoilStore(
  options: Partial<Store> & {
    normalizer?: { normalizeResponse: any };
  } = {}
): () => Store {
  const {
    getDataID = (record, type) => `${type}:${record.id}`,
    normalizer = createRelayNormalizer({ getDataID }),
    ref = (id) => ({ [constants.REF_KEY]: id }),
    refs = (ids) => ({
      [constants.REFS_KEY]: ids,
    }),
  } = options;

  const store = {
    getDataID,
    ref,
    get: throwError(),
    refs,
  };

  const useSelector = function <TData>(fragment: ReaderSelector) {
    return useRecoilValueLoadable(fragmentSelector(fragment)).contents as TData;
  };

  const useOperation = function <TQuery extends Query>(
    operation: OperationDescriptor<TQuery>
  ) {
    return useSelector(operation.fragment);
  };

  const useOperationPages = function <TQuery extends Query>(
    operation: OperationDescriptor<TQuery>,
    pageVariables: any[]
  ) {
    const data = useRecoilValueLoadable(
      fragmentPagesSelector([operation.request.node, pageVariables])
    ).contents as any;

    return data;
  };

  const useFragment: Store["useFragment"] = function (
    fragmentNode,
    fragmentRef
  ) {
    return useSelector(getSelector(fragmentNode, fragmentRef));
  };

  function useEntities() {
    return useRecoilValueLoadable(storeAtom).contents;
  }

  return function useStore() {
    const updateStore = useSetRecoilState(storeUpdater);

    const update = React.useCallback(
      function (recordSource: RecordSource) {
        updateStore(recordSource);
      },
      [updateStore]
    );

    const updateRecord = React.useCallback(
      (id: string, data: any) => {
        updateStore({
          [id]: data,
        });
      },
      [updateStore]
    );

    const commit = React.useCallback(
      function <TQuery extends Query>(
        operation: OperationDescriptor<TQuery>,
        data: Response<TQuery>
      ) {
        const recordSource = normalizer.normalizeResponse(
          operation.request.node,
          data,
          operation.request.variables
        );
        update(recordSource);
      },
      [update]
    );

    return {
      ...store,
      useSelector,
      update,
      updateRecord,
      useFragment,
      useOperation,
      useOperationPages,
      commit,
      useEntities,
    };
  };
}
