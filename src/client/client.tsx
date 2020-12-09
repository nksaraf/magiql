import type { ReactQueryConfig } from "react-query";
import { QueryCache } from "react-query";
import {
  Environment,
  Network,
  RecordSource,
  Store as RelayStore,
} from "relay-runtime";

import { composeExchanges, fallbackExchange } from "../exchanges/compose";
import { errorExchange } from "../exchanges/error";
import { relayExchange } from "../exchanges/relay";
import { createFetchOperation, fetchGraphQL } from "../fetch/fetchGraphQL";
import { createNormalizer, defaultGetDataId } from "../operation/normalizer";
import { createOperation } from "../operation/operation";
import { createRelayStore } from "../store/relay";
import {
  Operation,
  QueryKey,
  InfiniteQueryKey,
  Query,
  FetchOptions,
  Exchange,
  DebugEvent,
  GraphQLTaggedNode,
  Normalizer,
  constants,
  Store,
  GetDataID,
  OperationOptions,
} from "../types";
import type { SubscriptionClient } from "./subscription-client";

export const defaultExchanges: Exchange[] = [
  errorExchange({
    onError: (error) => {
      throw error;
    },
  }),
  relayExchange,
];

export function createRelayEnvironment({
  endpoint,
  fetchOptions,
  getDataID,
  onDebugEvent,
}) {
  return new Environment({
    network: Network.create(async (params, variables, cacheConfig) => {
      const fetchOperation = await createFetchOperation(
        params,
        variables,
        endpoint,
        [cacheConfig.metadata?.fetchOptions ?? {}, fetchOptions]
      );
      return await fetchGraphQL(fetchOperation);
    }),
    log: (event) => {
      onDebugEvent({
        ...event,
        timestamp: Date.now(),
      });
    },
    store: new RelayStore(new RecordSource(), {
      // @ts-ignore
      log: (event) => {
        onDebugEvent({
          ...event,
          timestamp: Date.now(),
        });
      },
    }),
    // @ts-ignore
    UNSTABLE_DO_NOT_USE_getDataID: getDataID,
  });
}

export interface GraphQLClientOptions {
  endpoint: string;
  fetchOptions?: FetchOptions<object>;
  queryConfig?: ReactQueryConfig;
  queryCache?: QueryCache;
  environment?: Environment;
  onDebugEvent?: <TQuery extends Query>(event: DebugEvent<TQuery>) => void;
  subscriptionClient?: SubscriptionClient | undefined;
  store?: Store;
  normalizer?: Normalizer;
  exchanges?: Exchange[];
  getDataID?: GetDataID;
}

function logger(log) {
  let last;

  return (event) => {
    if (process.env.NODE_ENV === "development") {
      log({
        ...event,
        diff: last ? event.timestamp - last.timestamp : 0,
      });
      last = event;
    }
  };
}

export class GraphQLClient {
  endpoint: string;
  fetchOptions: FetchOptions<object>;
  queryConfig: ReactQueryConfig<unknown, unknown>;
  queryCache: QueryCache;
  onDebugEvent: <TQuery extends Query>(event: DebugEvent<TQuery>) => void;
  store: Store;
  environment: Environment;
  normalizer: Normalizer;
  subscriptionClient?: SubscriptionClient;
  getDataID: GetDataID;
  exchanges: Exchange[];
  composedExchange: Exchange;

  constructor({
    endpoint = "/graphql",
    fetchOptions = {},
    queryConfig = {},
    getDataID = defaultGetDataId,
    queryCache = new QueryCache(),
    normalizer = createNormalizer({ getDataID }),
    onDebugEvent = logger((event) => console.log(event.name, "+" + event.diff)),
    environment = createRelayEnvironment({
      endpoint,
      fetchOptions,
      getDataID,
      onDebugEvent,
    }),
    store = createRelayStore({ environment }),
    exchanges = defaultExchanges,
    subscriptionClient,
  }: Partial<GraphQLClientOptions>) {
    this.endpoint = endpoint;
    this.fetchOptions = fetchOptions;
    this.queryConfig = queryConfig;
    this.queryCache = queryCache;
    this.store = store;
    this.onDebugEvent = onDebugEvent;
    this.normalizer = normalizer;
    this.exchanges = exchanges;
    this.composedExchange = composeExchanges(this.exchanges);
    this.subscriptionClient = subscriptionClient;
    if (this.subscriptionClient) {
      this.subscriptionClient.queryCache = this.queryCache;
    }
    this.getDataID = getDataID;
    this.environment = environment;
  }

  getInfinteQueryKey<TQuery extends Query>(
    operation: Operation<TQuery>
  ): InfiniteQueryKey<TQuery> {
    return [
      operation.request.node.params.name,
      operation.request.variables ?? {},
    ] as any;
  }

  createOperation<TQuery extends Query>(
    node: string | GraphQLTaggedNode,
    cacheConfig: OperationOptions<TQuery> = { variables: {} }
  ) {
    return createOperation(node, cacheConfig) as Operation<TQuery>;
  }

  createFragmentRef(record, type, fragmentName) {
    return {
      [constants.ID_KEY]: this.normalizer.getDataID(record, type),
      [constants.FRAGMENTS_KEY]: { [fragmentName]: {} },
      [constants.FRAGMENT_OWNER_KEY]: { variables: {} },
    };
  }

  getQueryKey<TQuery extends Query>(
    operation: Operation<TQuery>
  ): QueryKey<TQuery> {
    return [
      operation.request.node.params.name,
      operation.request.variables ?? {},
    ];
  }

  async execute<TQuery extends Query>(operation: Operation<TQuery>) {
    return await this.composedExchange({
      forward: fallbackExchange({
        client: this,
        forward: () => {
          throw new Error("");
        },
        dispatchDebug: this.onDebugEvent,
      }),
      client: this,
      dispatchDebug: this.onDebugEvent,
    })(operation);
  }
}
