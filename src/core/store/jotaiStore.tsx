import React from "react";
import { stableStringify } from "../../utils";
import { Provider, atom, Atom, useAtom } from "jotai";
import {
  getSelector,
  getStorageKey,
  RelayConcreteNode,
  SelectorData,
  SingularReaderSelector,
} from "relay-runtime";

import { assertBabelPlugin, throwError } from "../../utils";
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
import { createRelayNormalizer, defaultGetDataId } from "./relayNormalizer";

function atomFamily<T, TParam>({
  default: defaultValue,
  get,
  set,
  key: rootKey,
}: { key: (param: TParam) => string } & {
  default?: any;
  get?: any;
  set?: any;
}) {
  const atomCache: {
    [key: string]: { atom: Atom<T>; params: TParam };
  } = {};
  return Object.assign(
    (param: TParam) => {
      const key = rootKey(param);
      const cachedAtom = atomCache[key];
      if (cachedAtom != null) {
        return cachedAtom.atom;
      }
      let newAtom;
      if (typeof defaultValue !== "undefined") {
        newAtom = atom(defaultValue);
      } else if (get) {
        newAtom = atom(get(param), set ? set(param) : undefined);
      } else {
        throw new Error("either one of default or get should be defined");
      }

      atomCache[key] = {
        atom: newAtom,
        params: param,
      };

      return newAtom;
    },
    {
      cache: atomCache,
    }
  );
}

// function selectorFamily<T, TParam>({
//   key: rootKey,
//   get,
//   set,
// }: {
//   key: (param: TParam) => string;
//   get: (param: TParam) => ReadWriteSelectorOptions<T>["get"];
//   set?: (param: TParam) => ReadWriteSelectorOptions<T>["set"];
// }) {
//   const atomCache: {
//     [key: string]: { atom: RecoilState<T>; params: TParam };
//   } = {};
//   return Object.assign(
//     (param: TParam) => {
//       const key = rootKey(param);
//       const cachedAtom = atomCache[key];
//       if (cachedAtom != null) {
//         return cachedAtom.atom;
//       }

//       const newAtom = selector<T>({
//         key: rootKey(param),
//         get: get(param),
//         ...(set ? { set: set(param) } : {}),
//       }) as any;

//       atomCache[key] = {
//         atom: newAtom,
//         params: param,
//       };
//       return newAtom;
//     },
//     {
//       cache: atomCache,
//     }
//   );
// }

export const recordField = atomFamily<any, { id: string; field: string }>({
  default: null,
  key: ({ id, field }) => `${id}/${field}`,
});

export const recordRoot = atomFamily<Set<string> | null, string>({
  default: null,
  key: (id) => `${id}`,
});

export const record = atomFamily<any, any>({
  key: (param) => `record/${param}`,
  get: (param) => (get) => {
    const root = get(recordRoot(param));
    if (root === null) {
      return null;
    }

    const data = {};

    root.forEach((value) => {
      data[value] = get(recordField({ id: param, field: value }));
    });

    return data;
  },
  set: (param) => (get, set, recordData) => {
    let oldRoot = get(recordRoot(param));

    if (oldRoot === null) {
      oldRoot = new Set();
    }

    for (var key in recordData) {
      oldRoot.add(key);
      set(recordField({ id: param, field: key }), recordData[key]);
    }

    const newRoot = new Set(oldRoot.values());
    set(recordRoot(param), newRoot);
  },
});

export const fragmentSelector = atomFamily<any, any>({
  key: (param) => `fragment/${stableStringify(param)}`,
  get: (fragment) => (get) => {
    return readFragmentFromStore(get, fragment);
  },
});

export const fragmentPagesSelector = atomFamily<any, any>({
  key: (param) => `fragment/${stableStringify(param)}`,
  get: ([node, pageVariables]) => (get) => {
    return pageVariables.map((page: any) =>
      readFragmentFromStore(get, createOperation(node, page).fragment)
    );
  },
});

export const storeAtom = atom<any>(
  (get) => {
    return Object.entries(record.cache).map(([key, val]) => [
      val.params,
      get(val.atom),
    ]);
  },
  // @ts-ignore
  (_get, _set, _update) => {
    return;
  }
);

export const storeUpdater = atom(
  () => null as any,
  (get, set, recordSource: any) => {
    for (var id in recordSource) {
      set(record(id), recordSource[id]);
    }
    set(storeAtom, []);
  }
);

export function readFragmentFromStore<TData>(
  getter: any,
  selector: SingularReaderSelector
) {
  function traverse(node: ReaderNode, dataID: string, prevData: any) {
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

    const linkedArray: any[] = [];
    linkedIDs.forEach((linkedID: string, nextIndex: number) => {
      if (linkedID == null) {
        if (linkedID === undefined) {
          return null;
        }
        // $FlowFixMe[cannot-write]
        linkedArray.push(null);
        return;
      }
      const prevItem = null;

      linkedArray.push(traverse(field, linkedID, prevItem));
    });
    data[applicationName] = linkedArray;
    return linkedArray;
  }

  function readLink(field: ReaderLinkedField, dataID: string, data: any) {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, selector.variables);

    const linkedID = getter(recordField({ id: dataID, field: storageKey }));

    if (linkedID == null) {
      data[applicationName] = linkedID;
      if (linkedID === undefined) {
        return null;
      }
      return linkedID;
    }

    const prevData = data[applicationName];

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

    if (data[constants.ID_KEY] == null) {
      data[constants.ID_KEY] = dataID;
    }
    fragmentPointers[fragmentSpread.name] = {};
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

export function createJotaiStore(
  options: Partial<Store> & {
    normalizer?: { normalizeResponse: any };
  } = {}
): () => Store {
  const {
    getDataID = defaultGetDataId,
    normalizer = createRelayNormalizer({ getDataID }),
  } = options;

  const store = {
    getDataID,
    get: throwError(),
  };

  const useSelector = function <TData>(fragment: ReaderSelector) {
    if (!fragment) {
      throw new Error("no selector");
    }
    const [data, setData] = useAtom<TData>(fragmentSelector(fragment));
    return data as TData;
  };

  const useOperation = function <TQuery extends Query>(
    operation: OperationDescriptor<TQuery>
  ) {
    if (!operation.fragment) {
      throw new Error("babel plugin");
    }
    return useSelector(operation.fragment);
  };

  const useOperationPages = function <TQuery extends Query>(
    operation: OperationDescriptor<TQuery>,
    pageVariables: any[]
  ) {
    const [data, setData] = useAtom<any>(
      fragmentPagesSelector([operation.request.node, pageVariables])
    );

    return data;
  };

  const useFragment: Store["useFragment"] = function (
    fragmentNode,
    fragmentRef
  ) {
    if (!fragmentNode) {
      throw new Error("babel plugin");
    }
    const selector = getSelector(fragmentNode, fragmentRef);
    return useSelector(selector);
  };

  function useEntities() {
    const [data, setData] = useAtom<any>(storeAtom);
    return data;
  }

  function useStore() {
    const [_, updateStore] = useAtom(storeUpdater);

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
        assertBabelPlugin(operation.request.node.operation);
        const recordSource = normalizer.normalizeResponse(
          operation.request.node,
          data,
          operation.root?.variables
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
  }

  return Object.assign(useStore, {
    Provider: Provider as any,
  });
}
