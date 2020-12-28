import {
  DefaultOptions,
  QueryClient,
  QueryCache,
  QueryObserverOptions,
  MutationCache,
} from "react-query/core";
import {
  RelayNetworkLayer,
  urlMiddleware,
} from "react-relay-network-modern/node8";

import { Environment, RecordSource, Store } from "relay-runtime";

export class GQLClient extends QueryClient {
  url?: string;
  environment: Environment;

  constructor({
    defaultOptions = {},
    environment,
    getDataID = (record, type) => (record.id ? `${type}:${record.id}` : null),
    url,
  }: {
    url: string;
    getDataID?: any;
    environment?: Environment;
    defaultOptions?: DefaultOptions;
  }) {
    super({
      queryCache: new QueryCache(),
      mutationCache: new MutationCache(),
      defaultOptions,
    });
    this.url = url;
    this.environment =
      environment ??
      new Environment({
        network: new RelayNetworkLayer([
          urlMiddleware({
            url: (req) => {
              return this.url;
            },
          }),
        ]),
        // @ts-ignore
        UNSTABLE_DO_NOT_USE_getDataID: getDataID,

        store: new Store(new RecordSource(), {
          // @ts-ignore
          log: (event) => {
            console.log(event);
          },
        }),
        // @ts-ignore
        log: (event) => {
          console.log(event);
        },
      });
  }

  defaultQueryObserverOptions<
    T extends QueryObserverOptions<any, any, any, any>
  >(options?: T): T {
    return {
      url: this.url,
      ...this.defaultQueryOptions(options),
    };
  }

  get store() {
    return this.environment.getStore();
  }

  get network() {
    return this.environment.getNetwork();
  }
}
