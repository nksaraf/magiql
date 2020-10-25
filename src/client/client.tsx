import type { ReactQueryConfig } from "react-query";
import { composeExchanges, fallbackExchange } from "../exchanges/compose";
import { storeExchange } from "../exchanges/store";
import { fetchExchange } from "../exchanges/fetch";
import { errorExchange } from "../exchanges/error";
import { relayExchange } from "../exchanges/relay";
import { QueryCache } from "react-query";
import { createOperation } from "../operation/operation";
import {
  Operation,
  QueryKey,
  InfiniteQueryKey,
  Query,
  Variables,
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

import { createNormalizer, defaultGetDataId } from "../operation/normalizer";
import type { SubscriptionClient } from "./subscription-client";
import { createFetchOperation, fetchGraphQL } from "../fetch/fetchGraphQL";
import {
  Environment,
  Network,
  RecordSource,
  Store as RelayStore,
} from "relay-runtime";
import { createRelayStore } from "../store/relay";

export const defaultExchanges: Exchange[] = [
  storeExchange,
  errorExchange({
    onError: (error) => {
      throw error;
    },
  }),
  relayExchange,
  fetchExchange,
];

function createRelayEnvironment({ endpoint, fetchOptions }) {
  return new Environment({
    network: Network.create(async (params, variables) => {
      const fetchOperation = await createFetchOperation(
        params,
        variables,
        endpoint,
        fetchOptions
      );
      return await fetchGraphQL(fetchOperation);
    }),
    store: new RelayStore(new RecordSource()),
    // @ts-ignore
    UNSTABLE_DO_NOT_USE_getDataID: defaultGetDataId,
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

export class Client {
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
    environment = createRelayEnvironment({ endpoint, fetchOptions }),
    store = createRelayStore({ environment }),
    onDebugEvent = () => {},
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
    options: OperationOptions<TQuery> = { variables: {} }
  ) {
    return createOperation(node, options) as Operation<TQuery>;
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
        forward: null,
        dispatchDebug: this.onDebugEvent,
      }),
      client: this,
      dispatchDebug: this.onDebugEvent,
    })(operation);
  }
}
