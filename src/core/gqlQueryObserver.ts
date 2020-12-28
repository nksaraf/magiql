import { QueryObserver, QueryObserverOptions } from "react-query/core";
import {
  CacheConfig,
  createOperationDescriptor,
  Disposable,
  Environment,
  SingularReaderSelector,
} from "relay-runtime";
import {
  GraphQLTaggedNode,
  Operation,
  Query as IQuery,
  Variables,
} from "../types";
import { getRequest } from "../relay-compile-tag/parser";
import { GQLClient } from "./gqlClient";
import { executeQuery } from "./relayQuery";

export interface GQLQueryObserverOptions<
  TQuery extends IQuery,
  TError = Error,
  TData = TQuery["response"],
  TQueryData = TQuery["response"]
> extends QueryObserverOptions<TQuery["response"], TError, TData, TQueryData> {
  query?: string | GraphQLTaggedNode;
  variables?: Variables<TQuery>;
  cacheConfig?: CacheConfig;
  gqlClient?: GQLClient;
}

export class GQLQueryObserver<
  TQuery extends IQuery,
  TError = Error,
  TData = TQuery["response"],
  TQueryData = TQuery["response"]
> extends QueryObserver<TQuery["response"], TError, TData, TQueryData> {
  storeListener: Disposable;
  // options: GQLQueryObserverOptions<
  //   TQuery["response"],
  //   TError,
  //   TData,
  //   TQueryData
  // >;
  cacheConfig: CacheConfig;

  constructor(
    client: GQLClient,
    options: GQLQueryObserverOptions<TQuery, TError, TData, TQueryData>
  ) {
    super(client, { ...options, gqlClient: client } as any);
  }

  destroy() {
    this.storeListener?.dispose();
    super.destroy();
  }

  setOptions({
    query,
    variables,
    ...options
  }: GQLQueryObserverOptions<TQuery, TError, TData, TQueryData>) {
    const operation = createOperationDescriptor(
      getRequest(query),
      variables
    ) as Operation<TQuery>;

    let client = options.gqlClient || this.getOptions().gqlClient;

    let observer = this;

    const snapshot = client.environment.lookup(operation.fragment);
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
      queryKey: operation.request.identifier,
      queryFn: async () => {
        const { combinedError } = await executeQuery(
          client.environment,
          operation
        );

        if (combinedError) {
          throw combinedError;
        }

        const snapshot = observer.lookupAndSubscribe(
          client.environment,
          operation.fragment
        );

        return snapshot.data;
      },
      // @ts-ignore
      gqlClient: client,
      query,
      variables: variables ?? {},
    });
  }

  lookupAndSubscribe(
    environment: Environment,
    selector: SingularReaderSelector
  ) {
    const snapshot = environment.lookup(selector);

    if (this.storeListener) {
      this.storeListener.dispose();
    }

    this.storeListener = environment.subscribe(snapshot, (newSnapshot) => {
      this.getCurrentQuery().setData(newSnapshot.data as any);
    });

    return snapshot;
  }

  //
  getOptions() {
    return this.options as GQLQueryObserverOptions<
      TQuery,
      TError,
      TData,
      TQueryData
    >;
  }
}
