/**
 * Concept copied from the amazing `urql` client (without using streams)
 * https://github.com/FormidableLabs/urql/blob/main/packages/core/src/exchanges
 */

import type {
  Store,
  Exchange,
  ExchangeInput,
  Operation,
  Query,
  CombinedError,
} from "../types";
import type { GraphQLClient } from "../client";

export const composeExchanges = (exchanges: Exchange[]) => ({
  client,
  forward,
  dispatchDebug,
}: ExchangeInput) =>
  exchanges.reduceRight(
    (forward, exchange) =>
      exchange({
        client,
        forward,
        dispatchDebug(event) {
          dispatchDebug({
            timestamp: Date.now(),
            source: exchange.emoji,
            ...event,
          });
        },
      }),
    forward
  );

export const storeExchange = (store: Store) => {
  const storeExchange: Exchange = ({ forward, dispatchDebug }) => {
    return async (operation) => {
      const result = await forward(operation);
      if (result.extensions?.normalizedData && store.type === "normalized") {
        store.commit(operation, result.extensions?.normalizedData);
        dispatchDebug({
          type: "commit",
          message: "commited to store",
          operation,
          data: result.extensions?.normalizedData,
        });
      } else if (store.type === "normalized") {
        throw new Error("Normalized store expects normalized data");
      } else {
        store.commit(operation, result.data);
        dispatchDebug({
          type: "commit",
          message: "commited to store",
          operation,
          data: result.data,
        });
      }

      return result;
    };
  };
  storeExchange.emoji = "🗄";
  return storeExchange;
};

export const normalizerExchange: Exchange = ({
  forward,
  client,
  dispatchDebug,
}) => {
  return async (operation) => {
    const result = await forward(operation);
    const { data } = result;
    const normalizedData = client.normalizer
      ? client.normalizer.normalizeResponse(data, operation)
      : data;

    dispatchDebug({
      type: "normalize",
      message: "normalized response",
      operation,
      data: {
        raw: data,
        normalized: normalizedData,
      },
    });

    return {
      ...result,
      extensions: {
        normalizedData,
      },
    };
  };
};

normalizerExchange.emoji = "🗃";

export interface AuthExchangeConfig<T> {
  didAuthError(params: { error: CombinedError }): boolean;
  refreshAuthState({ authState: T }): Promise<T | null>;
  getAuthState(): T | null;
  addAuthToOperation<TQuery extends Query>(params: {
    operation: Operation<TQuery>;
    authState: T | null;
    client: GraphQLClient;
  }): Promise<Operation<TQuery>>;
  onAuthFailed(): void;
  willAuthError?<TQuery extends Query>(params: {
    operation: Operation<TQuery>;
    authState: T | null;
  }): boolean;
}

export function authExchange<T>({
  refreshAuthState,
  didAuthError,
  // willAuthError,
  getAuthState,
  addAuthToOperation,
  onAuthFailed,
}: AuthExchangeConfig<T>): Exchange {
  const authExchange: Exchange = ({ client, forward, dispatchDebug }) => {
    return async (operation) => {
      let authState = getAuthState();
      let operationWithAuth = await addAuthToOperation({
        operation,
        authState,
        client,
      });

      let result = await forward(operationWithAuth);

      if (
        result.error &&
        didAuthError &&
        didAuthError({ error: result.error })
      ) {
        dispatchDebug({
          type: "authError",
          message: "auth error",
          data: result.error,
          operation: operationWithAuth,
        });

        dispatchDebug({
          type: "refreshAuthRequest",
          message: "refreshing auth",
          data: authState,
          operation: operationWithAuth,
        });
        authState = await refreshAuthState({ authState });

        if (authState) {
          dispatchDebug({
            type: "refreshAuthSuccess",
            message: "succesfully refreshed auth",
            data: authState,
            operation: operationWithAuth,
          });
          operationWithAuth = await addAuthToOperation({
            operation,
            authState,
            client,
          });
          result = await forward(operationWithAuth);
          if (
            result.error &&
            didAuthError &&
            didAuthError({ error: result.error })
          ) {
            dispatchDebug({
              type: "authFailed",
              message: "failed auth",
              data: authState,
              operation: operationWithAuth,
            });
            onAuthFailed();
          }
        } else {
          dispatchDebug({
            type: "authFailed",
            message: "failed auth",
            data: authState,
            operation: operationWithAuth,
          });
          onAuthFailed();
        }
      }

      return result;
    };
  };
  authExchange.emoji = "🔓";
  return authExchange;
}
