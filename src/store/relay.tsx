import React from "react";
import { QueryCache } from "react-query";
import { ReaderFragment } from "relay-runtime";
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment";
import { getSelector } from "relay-runtime/lib/store/RelayModernSelector";
import getFragmentIdentifier from "relay-runtime/lib/util/getFragmentIdentifier";

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
  Variables,
  KeyType,
} from "../types";
import { stableStringify } from "../utils/stringify";
import { FragmentResource, FragmentResult, isMissingData } from "./fragment";

export const createStore = (store: Store) => {
  return store;
};

export type SelectorSnapshot<TData, TPlural extends boolean = boolean> = {
  disableStoreUpdates: () => void;
  isMissingData: boolean;
  enableStoreUpdates: () => void;
  shouldUpdateGeneration: number;
  cacheKey: string;
} & FragmentResult<TData, TPlural>;

export function createRelayStore({
  environment,
}: {
  environment: RelayModernEnvironment;
}): Store {
  const fragmentResource = new FragmentResource(environment);

  function useSelector<
    TData,
    TKey extends KeyType | KeyType[],
    TPlural extends boolean = TKey extends any[] ? true : false
  >(
    fragmentNode: ReaderFragment,
    fragmentRef: TKey
  ): SelectorSnapshot<TData, TPlural> {
    const isMountedRef = React.useRef(false);
    const rerender = useRerenderer();

    // The values of these React refs are counters that should be incremented
    // under their respective conditions. This allows us to use the counters as
    // memoization values to indicate if computations for useMemo or useEffect
    // should be re-executed.
    const fragmentIdentifier = getFragmentIdentifier(fragmentNode, fragmentRef);

    const mustResubscribeGenerationRef = React.useRef(0);
    const shouldUpdateGenerationRef = React.useRef(0);

    const environmentChanged = useHasChanged(environment);
    const fragmentIdentifierChanged = useHasChanged(fragmentIdentifier);

    // If the fragment identifier changes, it means that the variables on the
    // fragment owner changed, or the fragment ref points to different records.
    // In this case, we need to resubscribe to the Relay store.
    const mustResubscribe = environmentChanged || fragmentIdentifierChanged;

    // We only want to update the component consuming this fragment under the
    // following circumstances:
    // - We receive an update from the Relay store, indicating that the data
    //   the component is directly subscribed to has changed.
    // - We need to subscribe and render /different/ data (i.e. the fragment refs
    //   now point to different records, or the context changed).
    //   Note that even if identity of the fragment ref objects changes, we
    //   don't consider them as different unless they point to a different data ID.
    //
    // This prevents unnecessary updates when a parent re-renders this component
    // with the same props, which is a common case when the parent updates due
    // to change in the data /it/ is subscribed to, but which doesn't affect the
    // child.

    if (mustResubscribe) {
      shouldUpdateGenerationRef.current++;
      mustResubscribeGenerationRef.current++;
    }

    // Read fragment data; this might suspend.
    const fragmentResult = fragmentResource.readWithIdentifier<
      TData,
      typeof fragmentRef,
      TPlural
    >(fragmentNode, fragmentRef, fragmentIdentifier);

    const isListeningForUpdatesRef = React.useRef(true);

    function enableStoreUpdates() {
      isListeningForUpdatesRef.current = true;
      const didMissUpdates = fragmentResource.checkMissedUpdates(
        fragmentResult
      )[0];
      if (didMissUpdates) {
        handleDataUpdate();
      }
    }

    function disableStoreUpdates() {
      isListeningForUpdatesRef.current = false;
    }

    function handleDataUpdate() {
      if (
        isMountedRef.current === false ||
        isListeningForUpdatesRef.current === false
      ) {
        return;
      }

      // If we receive an update from the Relay store, we need to make sure the
      // consuming component updates.
      shouldUpdateGenerationRef.current++;

      // React bails out on noop state updates as an optimization.
      // If we want to force an update via setState, we need to pass an value.
      // The actual value can be arbitrary though, e.g. an incremented number.
      rerender();
    }

    // Establish Relay store subscriptions in the commit phase, only if
    // rendering for the first time, or if we need to subscribe to new data
    React.useEffect(() => {
      isMountedRef.current = true;
      const disposable = fragmentResource.subscribe(
        fragmentResult,
        handleDataUpdate
      );

      return () => {
        // When unmounting or resubscribing to new data, clean up current
        // subscription. This will also make sure fragment data is no longer
        // cached for the so next time it its read, it will be read fresh from the
        // Relay store
        isMountedRef.current = false;
        disposable.dispose();
      };
      // NOTE: We disable react-hooks-deps warning because mustResubscribeGenerationRef
      // is capturing all information about whether the effect should be re-ran.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mustResubscribeGenerationRef.current]);

    return {
      // $FlowFixMe[incompatible-return]
      ...fragmentResult,
      disableStoreUpdates,
      isMissingData: fragmentResult.snapshot
        ? isMissingData(fragmentResult.snapshot)
        : true,
      enableStoreUpdates,
      shouldUpdateGeneration: shouldUpdateGenerationRef.current,
    };
  }

  function useEntities() {
    const [entities, setEntities] = React.useState<any>([]);

    React.useEffect(() => {
      const source = environment.getStore().getSource();
      const recordsIds = source.getRecordIDs();
      setEntities([...recordsIds.map((id) => [id, source.get(id)])]);
    }, []);

    return entities;
  }

  function useOperationPages<TQuery extends Query>(
    operation: Operation<TQuery>,
    pageVariables: object[]
  ) {
    const refs = pageVariables.map((vars, index) => ({
      __id: operation.fragment.dataID,
      __fragments: {
        [operation.fragment.node.name]: vars,
      },
      __fragmentOwner: operation.request,
    }));

    return useSelector<Response<TQuery>, KeyType[]>(
      {
        ...operation.request.node.fragment,
        metadata: { plural: true },
      },
      refs as any
    );
  }

  return createStore({
    type: "relayStore",
    isNormalized: false,
    update: (recordSource: RecordSource) => {},
    environment,
    useSelector,
    updateRecord: () => {},
    useOperationPages,
    useFragment: (fragmentNode, fragmentRef) => {
      return useSelector(fragmentNode, fragmentRef);
    },
    useOperation: <TQuery extends Query>(operation: Operation<TQuery>) => {
      const rootFragmentRef = {
        __id: operation.fragment.dataID,
        __fragments: {
          [operation.fragment.node.name]: operation.request.variables,
        },
        __fragmentOwner: operation.request,
      };

      return useSelector<Response<TQuery>, KeyType>(
        operation.request.node.fragment,
        rootFragmentRef as any
      );
    },
    useRecords: useEntities,
    get: {} as any,
  });
}

function useHasChanged(value: any): boolean {
  const [mirroredValue, setMirroredValue] = React.useState(value);
  const valueChanged =
    stableStringify(mirroredValue) !== stableStringify(value);
  if (valueChanged) {
    setMirroredValue(value);
  }
  return valueChanged;
}
