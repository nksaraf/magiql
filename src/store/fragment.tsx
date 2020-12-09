import invariant from "invariant";
import {
  getSelector,
  PluralReaderSelector,
  ReaderSelector,
  SingularReaderSelector,
} from "relay-runtime";
import type { Disposable, IEnvironment, ReaderFragment } from "relay-runtime";
import recycleNodesInto from "relay-runtime/lib/util/recycleNodesInto";

import { Snapshot, KeyType } from "../types";

export type SingularOrPluralSnapshot<
  TData,
  TPlural extends boolean = boolean
> = TPlural extends true ? Snapshot<TData>[] : Snapshot<TData>;

export type FragmentResult<TData, TPlural extends boolean = boolean> = {
  cacheKey: string;
  data: null | (TPlural extends true ? TData[] : TData);
  isMissingData: any;
  snapshot: SingularOrPluralSnapshot<TData, TPlural> | null;
};

// TODO: Fix to not rely on LRU. If the number of active fragments exceeds this
// capacity, readSpec() will fail to find cached entries and break object
// identity even if data hasn't changed.{
const CACHE_CAPACITY = 1000000;

const createCache = () => {
  const cache = {};
  return {
    get: (key) => cache[key],
    set: (key, val) => {
      cache[key] = val;
    },
    delete: (key) => {
      delete cache[key];
    },
  };
};

export function isMissingData(snapshot: SingularOrPluralSnapshot<any>) {
  if (Array.isArray(snapshot)) {
    return snapshot.some((s) => s.isMissingData);
  }
  return snapshot.isMissingData;
}

function getFragmentResult<TData>(
  cacheKey: string,
  snapshot: SingularOrPluralSnapshot<TData>
): FragmentResult<TData> {
  if (Array.isArray(snapshot)) {
    return {
      cacheKey,
      snapshot,
      data: snapshot.map((s) => s.data),
      isMissingData: isMissingData(snapshot),
    };
  }
  return {
    cacheKey,
    snapshot,
    data: snapshot.data,
    isMissingData: isMissingData(snapshot),
  };
}

export class FragmentResource {
  _environment: IEnvironment;
  _cache: ReturnType<typeof createCache>;

  constructor(environment: IEnvironment) {
    this._environment = environment;
    this._cache = createCache();
  }

  /**
   * Like `read`, but with pre-computed fragmentIdentifier that should be
   * equal to `getFragmentIdentifier(fragmentNode, fragmentRef)` from the
   * arguments.
   */
  readWithIdentifier<
    TData,
    TKey extends KeyType | KeyType[],
    TPlural extends boolean = KeyType extends any[] ? true : false
  >(
    fragmentNode: ReaderFragment,
    fragmentRef: TKey,
    fragmentIdentifier: string,
    fragmentKey?: string,
    componentDisplayName?: string,
  ): FragmentResult<TData, TPlural> {
    const environment = this._environment;

    // If fragmentRef is null or undefined, pass it directly through.
    // This is a convenience when consuming fragments via a HOC api, when the
    // prop corresponding to the fragment ref might be passed as null.
    if (fragmentRef == null) {
      return {
        cacheKey: fragmentIdentifier,
        data: null,
        snapshot: null,
        isMissingData: true,
      };
    }

    // If fragmentRef is plural, ensure that it is an array.
    // If it's empty, return the empty array direclty before doing any more work.
    if (fragmentNode?.metadata?.plural === true) {
      invariant(
        Array.isArray(fragmentRef),
        "Relay: Expected fragment pointer%s for fragment `%s` to be " +
          "an array, instead got `%s`. Remove `@relay(plural: true)` " +
          "from fragment `%s` to allow the prop to be an object.",
        fragmentKey != null ? ` for key \`${fragmentKey}\`` : "",
        fragmentNode.name,
        typeof fragmentRef,
        fragmentNode.name
      );
      // if (fragmentRef.length === 0) {
      //   return { cacheKey: fragmentIdentifier, data: [], snapshot: [] };
      // }
    }

    // Now we actually attempt to read the fragment:

    // 1. Check if there's a cached value for this fragment
    const cachedValue = this._cache.get(fragmentIdentifier);

    if (cachedValue != null && cachedValue.snapshot) {
      return cachedValue;
    }

    // 2. If not, try reading the fragment from the Relay store.
    // If the snapshot has data, return it and save it in cache
    const fragmentSelector = getSelector(fragmentNode, fragmentRef);

    invariant(
      fragmentSelector != null,
      'Relay: Expected to receive an object where `...%s` was spread, ' +
        'but the fragment reference was not found`. This is most ' +
        'likely the result of:\n' +
        "- Forgetting to spread `%s` in `%s`'s parent's fragment.\n" +
        '- Conditionally fetching `%s` but unconditionally passing %s prop ' +
        'to `%s`. If the parent fragment only fetches the fragment conditionally ' +
        '- with e.g. `@include`, `@skip`, or inside a `... on SomeType { }` ' +
        'spread  - then the fragment reference will not exist. ' +
        'In this case, pass `null` if the conditions for evaluating the ' +
        'fragment are not met (e.g. if the `@include(if)` value is false.)',
      fragmentNode.name,
      fragmentNode.name,
      componentDisplayName,
      fragmentNode.name,
      fragmentKey == null ? 'a fragment reference' : `the \`${fragmentKey}\``,
      componentDisplayName,
    );

    const snapshot: SingularOrPluralSnapshot<TData> = (fragmentSelector.kind ===
    "PluralReaderSelector"
      ? (fragmentSelector as PluralReaderSelector).selectors.map((s) =>
          environment.lookup(s)
        )
      : environment.lookup(fragmentSelector as SingularReaderSelector)) as any;

    const fragmentOwner =
      fragmentSelector.kind === "PluralReaderSelector"
        ? (fragmentSelector as PluralReaderSelector).selectors[0].owner
        : (fragmentSelector as SingularReaderSelector).owner;

    const parentQueryName =
      fragmentOwner?.node?.params?.name ?? "Unknown Parent Query";

    if (!isMissingData(snapshot)) {
      const fragmentResult = getFragmentResult<TData>(
        fragmentIdentifier,
        snapshot
      );
      this._cache.set(fragmentIdentifier, fragmentResult);
      return fragmentResult;
    }

    return {
      data: null,
      isMissingData: true,
      snapshot: null,
      cacheKey: fragmentIdentifier,
    };
  }

  //   // 3. If we don't have data in the store, check if a request is in
  //   // flight for the fragment's parent query, or for another operation
  //   // that may affect the parent's query data, such as a mutation
  //   // or subscription. If a promise exists, cache the promise and use it
  //   // to suspend.
  //   const networkPromise = this._getAndSavePromiseForFragmentRequestInFlight(
  //     fragmentIdentifier,
  //     fragmentOwner,
  //   );
  //   if (networkPromise != null) {
  //     throw networkPromise;
  //   }

  //   // 5. If a cached value still isn't available, raise a warning.
  //   // This means that we're trying to read a fragment that isn't available
  //   // and isn't being fetched at all.
  //   warning(
  //     false,
  //     'Relay: Tried reading fragment `%s` declared in ' +
  //       '`%s`, but it has missing data and its parent query `%s` is not ' +
  //       'being fetched.\n' +
  //       'This might be fixed by by re-running the Relay Compiler. ' +
  //       ' Otherwise, make sure of the following:\n' +
  //       '* You are correctly fetching `%s` if you are using a ' +
  //       '"store-only" `fetchPolicy`.\n' +
  //       "* Other queries aren't accidentally fetching and overwriting " +
  //       'the data for this fragment.\n' +
  //       '* Any related mutations or subscriptions are fetching all of ' +
  //       'the data for this fragment.\n' +
  //       "* Any related store updaters aren't accidentally deleting " +
  //       'data for this fragment.',
  //     fragmentNode.name,
  //     componentDisplayName,
  //     parentQueryName,
  //     parentQueryName,
  //   );

  //   this._reportMissingRequiredFieldsInSnapshot(snapshot);
  //   return getFragmentResult(fragmentIdentifier, snapshot);
  // }

  // _reportMissingRequiredFieldsInSnapshot(snapshot: SingularOrPluralSnapshot) {
  //   if (Array.isArray(snapshot)) {
  //     snapshot.forEach(s => {
  //       if (s.missingRequiredFields != null) {
  //         reportMissingRequiredFields(
  //           this._environment,
  //           s.missingRequiredFields,
  //         );
  //       }
  //     });
  //   } else {
  //     if (snapshot.missingRequiredFields != null) {
  //       reportMissingRequiredFields(
  //         this._environment,
  //         snapshot.missingRequiredFields,
  //       );
  //     }
  //   }
  // }

  // readSpec(
  //   fragmentNodes: {[string]: ReaderFragment, ...},
  //   fragmentRefs: {[string]: mixed, ...},
  //   componentDisplayName: string,
  // ): {[string]: FragmentResult, ...} {
  //   return mapObject(fragmentNodes, (fragmentNode, fragmentKey) => {
  //     const fragmentRef = fragmentRefs[fragmentKey];
  //     return this.read(
  //       fragmentNode,
  //       fragmentRef,
  //       componentDisplayName,
  //       fragmentKey,
  //     );
  //   });
  // }

  subscribe(
    fragmentResult: FragmentResult<any>,
    callback: () => void
  ): Disposable {
    const environment = this._environment;
    const { cacheKey } = fragmentResult;
    const renderedSnapshot = fragmentResult.snapshot;
    if (!renderedSnapshot) {
      return { dispose: () => {} };
    }

    // 1. Check for any updates missed during render phase
    // TODO(T44066760): More efficiently detect if we missed an update
    const [didMissUpdates, currentSnapshot] = this.checkMissedUpdates(
      fragmentResult
    );

    // 2. If an update was missed, notify the component so it updates with
    // latest data.
    if (didMissUpdates) {
      callback();
    }

    // 3. Establish subscriptions on the snapshot(s)
    const dataSubscriptions: Disposable[] = [];
    if (Array.isArray(renderedSnapshot)) {
      invariant(
        Array.isArray(currentSnapshot),
        "Relay: Expected snapshots to be plural. " +
          "If you're seeing this, this is likely a bug in Relay."
      );
      (currentSnapshot as Snapshot<any>[]).forEach((snapshot, idx) => {
        dataSubscriptions.push(
          environment.subscribe(snapshot, (latestSnapshot) => {
            this._updatePluralSnapshot(
              cacheKey,
              currentSnapshot as Snapshot<any>[],
              latestSnapshot,
              idx
            );
            callback();
          })
        );
      });
    } else {
      invariant(
        currentSnapshot != null && !Array.isArray(currentSnapshot),
        "Relay: Expected snapshot to be singular. " +
          "If you're seeing this, this is likely a bug in Relay."
      );
      dataSubscriptions.push(
        environment.subscribe(
          currentSnapshot as Snapshot<any>,
          (latestSnapshot) => {
            this._cache.set(
              cacheKey,
              getFragmentResult(cacheKey, latestSnapshot)
            );
            callback();
          }
        )
      );
    }

    return {
      dispose: () => {
        dataSubscriptions.map((s) => s.dispose());
        this._cache.delete(cacheKey);
      },
    };
  }

  checkMissedUpdates(
    fragmentResult: FragmentResult<any>
  ): [boolean, SingularOrPluralSnapshot<any> | null] {
    const environment = this._environment;
    const { cacheKey } = fragmentResult;
    const renderedSnapshot = fragmentResult.snapshot;
    if (!renderedSnapshot) {
      return [false, null];
    }

    let didMissUpdates = false;

    if (Array.isArray(renderedSnapshot)) {
      const currentSnapshots: Snapshot<any>[] = [];
      renderedSnapshot.forEach((snapshot, idx) => {
        let currentSnapshot = environment.lookup(snapshot.selector);
        const renderData = snapshot.data;
        const currentData = currentSnapshot.data;
        const updatedData = recycleNodesInto(renderData, currentData);
        if (updatedData !== renderData) {
          currentSnapshot = { ...currentSnapshot, data: updatedData };
          didMissUpdates = true;
        }
        currentSnapshots[idx] = currentSnapshot;
      });
      if (didMissUpdates) {
        this._cache.set(
          cacheKey,
          getFragmentResult(cacheKey, currentSnapshots)
        );
      }
      return [didMissUpdates, currentSnapshots];
    }
    let currentSnapshot = environment.lookup(renderedSnapshot.selector);
    const renderData = renderedSnapshot.data;
    const currentData = currentSnapshot.data;
    const updatedData = recycleNodesInto(renderData, currentData);
    currentSnapshot = {
      data: updatedData,
      isMissingData: currentSnapshot.isMissingData,
      seenRecords: currentSnapshot.seenRecords,
      selector: currentSnapshot.selector,
    };
    if (updatedData !== renderData) {
      this._cache.set(cacheKey, getFragmentResult(cacheKey, currentSnapshot));
      didMissUpdates = true;
    }
    return [didMissUpdates, currentSnapshot];
  }

  _updatePluralSnapshot(
    cacheKey: string,
    baseSnapshots: Snapshot<any>[],
    latestSnapshot: Snapshot<any>,
    idx: number
  ): void {
    const currentFragmentResult = this._cache.get(cacheKey);

    const currentSnapshot = currentFragmentResult?.snapshot;
    if (currentSnapshot && !Array.isArray(currentSnapshot)) {
      return;
    }

    const nextSnapshots = currentSnapshot
      ? [...currentSnapshot]
      : [...baseSnapshots];
    nextSnapshots[idx] = latestSnapshot;
    this._cache.set(cacheKey, getFragmentResult(cacheKey, nextSnapshots));
  }
}
