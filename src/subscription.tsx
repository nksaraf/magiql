import { SubscriptionClient } from "subscriptions-transport-ws";
import { resolveFetchOptions } from "./fetch";
import { FetchOptions } from "./types";

export class GraphQLSubscriptionClient extends SubscriptionClient {
  endpoint: string;
  fetchOptions: FetchOptions<object>;

  constructor({
    endpoint,
    fetchOptions,
  }: {
    endpoint: string;
    fetchOptions: FetchOptions<object>;
  }) {
    super(endpoint, {
      reconnect: true,
      connectionParams: async () => {
        return await resolveFetchOptions(fetchOptions, {
          operationKind: "subscription",
          endpoint: endpoint,
        });
      },
    });
    this.endpoint = endpoint;
    this.fetchOptions = fetchOptions;
  }
}
