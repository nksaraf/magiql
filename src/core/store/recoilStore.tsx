import React from "react";
import { stableStringify } from "../../utils";
import {
  atom,
  ReadWriteSelectorOptions,
  RecoilState,
  selector,
  useRecoilValueLoadable,
  useSetRecoilState,
  RecoilRoot,
} from "recoil";
import { getSelector } from "relay-runtime";

import { throwError } from "../../utils";
import { createOperation } from "../parser";
import {
  Operation,
  Query,
  Response,
  Store,
  ReaderSelector,
  RecordSource,
} from "../types";
import { readFragment, createFieldReader } from "../reader";

function atomFamily<T, TParam>({
  default: defaultValue,
  key: rootKey,
}: {
  default: T;
  key: (param: TParam) => string;
}) {
  const atomCache: {
    [key: string]: { atom: RecoilState<T>; params: TParam };
  } = {};
  return Object.assign(
    (param: TParam) => {
      const key = rootKey(param);
      const cachedAtom = atomCache[key];
      if (cachedAtom != null) {
        return cachedAtom.atom;
      }

      const newAtom = atom<T>({
        key: rootKey(param),
        default: defaultValue,
      });

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

function selectorFamily<T, TParam>({
  key: rootKey,
  get,
  set,
}: {
  key: (param: TParam) => string;
  get: (param: TParam) => ReadWriteSelectorOptions<T>["get"];
  set?: (param: TParam) => ReadWriteSelectorOptions<T>["set"];
}) {
  const atomCache: {
    [key: string]: { atom: RecoilState<T>; params: TParam };
  } = {};

  return Object.assign(
    (param: TParam) => {
      const key = rootKey(param);
      const cachedAtom = atomCache[key];
      if (cachedAtom != null) {
        return cachedAtom.atom;
      }

      const newAtom = selector<T>({
        key: rootKey(param),
        get: get(param),
        ...(set ? { set: set(param) } : {}),
      }) as any;

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

export const recordField = atomFamily<any, { id: string; field: string }>({
  default: null,
  key: ({ id, field }) => `${id}/${field}`,
});

export const recordRoot = atomFamily<Set<string> | null, string>({
  default: null,
  key: (id) => `${id}`,
});

export const record = selectorFamily<any, any>({
  key: (param) => `record/${param}`,
  get: (param) => ({ get }) => {
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
  set: (param) => ({ set, get }, recordData) => {
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

export const fragmentSelector = selectorFamily<any, any>({
  key: (param) => `fragment/${stableStringify(param)}`,
  get: (fragment) => ({ get }) => {
    return readFragment(
      createFieldReader(({ id, field }) => get(recordField({ id, field }))),
      fragment
    );
  },
});

export const fragmentPagesSelector = selectorFamily<any, any>({
  key: (param) => `fragment/${stableStringify(param)}`,
  get: ([node, pageVariables]) => ({ get }) => {
    const reader = createFieldReader(({ id, field }) =>
      get(recordField({ id, field }))
    );
    return pageVariables.map((page: any) =>
      readFragment(reader, createOperation(node, page).fragment)
    );
  },
});

const storeMock = atom({
  default: [],
  key: "storeAtom",
});

export const storeAtom = selector<any>({
  key: "store",
  get: ({ get }) => {
    get(storeMock);
    return Object.entries(record.cache).map(([key, val]) => [
      val.params,
      get(val.atom),
    ]);
  },
  set: ({ set }, val) => {
    set(storeMock, val);
  },
});

export const storeUpdater = selector({
  key: "storeUpdater",
  get: () => null as any,
  set: ({ set }, recordSource) => {
    for (var id in recordSource) {
      set(record(id), recordSource[id]);
    }
    set(storeAtom, []);
  },
});

export function createRecoilStore(): () => Store {
  const store = {
    get: throwError(),
  };

  const useSelector = function <TData>(fragment: ReaderSelector) {
    return useRecoilValueLoadable(fragmentSelector(fragment)).contents as TData;
  };

  const useOperation = function <TQuery extends Query>(
    operation: Operation<TQuery>
  ) {
    return useSelector(operation.fragment);
  };

  const useOperationPages = function <TQuery extends Query>(
    operation: Operation<TQuery>,
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
    const selector = getSelector(fragmentNode, fragmentRef);
    return useSelector(selector);
  };

  function useEntities() {
    return useRecoilValueLoadable(storeAtom).contents;
  }

  function useStore() {
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
        operation: Operation<TQuery>,
        data: Response<TQuery>
      ) {
        update(data);
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
      type: "normalized" as const,
      Provider: RecoilRoot as any,
    };
  }

  return Object.assign(useStore, {
    Provider: RecoilRoot as any,
  });
}
