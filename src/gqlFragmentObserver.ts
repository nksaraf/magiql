import { QueryObserver, QueryObserverOptions } from "react-query/core";
import {
  Disposable,
  getFragmentIdentifier,
  getSingularSelector,
  GraphQLTaggedNode,
} from "relay-runtime";
import { $Call, KeyType, KeyReturnType } from "./types";
import { getFragment } from "./relay-parser/parser";
import { GQLClient } from "./gqlClient";

export interface GQLFragmentObserverOptions<
  TKey extends KeyType,
  TError = Error
> extends QueryObserverOptions<
    TKey extends KeyType ? $Call<KeyReturnType<TKey>> : null,
    TError,
    TKey extends KeyType ? $Call<KeyReturnType<TKey>> : null,
    TKey extends KeyType ? $Call<KeyReturnType<TKey>> : null
  > {
  fragment?: string | GraphQLTaggedNode;
  fragmentRef?: TKey;
  gqlClient?: GQLClient;
}
export class GQLFragmentObserver<
  TKey extends KeyType = any,
  TError = Error
> extends QueryObserver<
  TKey extends KeyType ? $Call<KeyReturnType<TKey>> : null,
  TError,
  TKey extends KeyType ? $Call<KeyReturnType<TKey>> : null,
  TKey extends KeyType ? $Call<KeyReturnType<TKey>> : null
> {
  storeListener: Disposable;

  constructor(
    gqlClient: GQLClient,
    options: GQLFragmentObserverOptions<TKey, TError>
  ) {
    // if (!fragment) {
    //   throw new Error(
    //     "No GraphQL node provided for Query. Pass a `graphql` tagged template literal with your GraphQL Query for the `node` option to QueryObserver."
    //   );
    // }
    super(gqlClient, { ...options, gqlClient: gqlClient } as any);
  }

  destroy() {
    this.storeListener?.dispose();
    super.destroy();
  }

  setOptions({
    fragment,
    fragmentRef,
    ...options
  }: GQLFragmentObserverOptions<TKey, TError>) {
    const node = getFragment(fragment);

    let client = options.gqlClient || this.getOptions().gqlClient;

    let observer = this;

    let selector = getSingularSelector(node, fragmentRef);

    const snapshot = client.environment.lookup(selector);

    if (!snapshot.isMissingData) {
      if (observer.storeListener) {
        observer.storeListener.dispose();
      }

      observer.storeListener = client.environment.subscribe(
        snapshot,
        (newSnapshot) => {
          observer.getCurrentQuery().setData(newSnapshot.data as any);
        }
      );
    }

    super.setOptions({
      ...options,
      initialData: snapshot.isMissingData ? undefined : (snapshot.data as any),
      queryKey: getFragmentIdentifier(node, fragmentRef),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      staleTime: 1000000,
      queryFn: async () => {
        return new Promise((resolve, reject) => {
          try {
            const snapshot = client.environment.lookup(selector);

            if (observer.storeListener) {
              observer.storeListener.dispose();
            }

            observer.storeListener = client.environment.subscribe(
              snapshot,
              (newSnapshot) => {
                if (!newSnapshot.isMissingData) {
                  observer.getCurrentQuery().setData(newSnapshot.data as any);
                  resolve(newSnapshot.data as any);
                } else {
                }
              }
            );

            if (!snapshot.isMissingData) {
              resolve(snapshot.data as any);
            }
          } catch (e) {
            reject(e);
          }
        });
      },
      // @ts-ignore
      gqlClient: client,
      fragment,
      fragmentRef,
      fragmentNode: node,
    });
  }

  getOptions() {
    return this.options as GQLFragmentObserverOptions<TKey, TError>;
  }
}
