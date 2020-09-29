/**
 * Concept copied from the amazing `urql` client (without using streams)
 * https://github.com/FormidableLabs/urql/blob/main/packages/core/src/exchanges
 */

import { fetchGraphQL, resolveFetchOptions } from "./fetchGraphQL";
import {
  OperationKind,
  Store,
  Exchange,
  ExchangeInput,
  Operation,
  Query,
  FetchOperation,
  Variables,
  CombinedError,
} from "./types";
import deepMerge from "deepmerge";
import { GraphQLClient } from "./graphQLClient";

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

export const errorExchange = ({
  onError = (error) => {
    throw error;
  },
}: {
  onError?: (error: CombinedError) => void;
}) => {
  const errorExchange: Exchange = ({ forward }) => {
    return async (operation) => {
      const operationResult = await forward(operation);
      const { error } = operationResult;
      if (error) {
        onError(error);
      }

      return operationResult;
    };
  };
  errorExchange.emoji = "❗";
  return errorExchange;
};

export const fallbackExchange: Exchange = function fallbackExchange() {
  return async () => {
    throw new Error("operation is not supported");
  };
};
fallbackExchange.emoji = "❓";

export const debugExchange: Exchange = function debugExchange({ forward }) {
  return async (operation) => {
    console.log(
      "🚀",
      operation.request.node.params.name,
      JSON.stringify(operation.request.variables),
      "fetching"
    );
    const operationResult = await forward(operation);
    console.log(
      "📦",
      operation.request.node.params.name,
      JSON.stringify(operation.request.variables),
      ...[operationResult.data && "success", operationResult.error].filter(
        Boolean
      )
    );
    return operationResult;
  };
};

export async function createFetchOperation<TQuery extends Query>(
  operation: Operation<TQuery>,
  client: GraphQLClient
): Promise<FetchOperation<Variables<TQuery>>> {
  const fetchOperation = {
    query: operation.request.node,
    operationName: operation.request.node.params.name,
    operationKind: operation.request.node.params.operationKind as OperationKind,
    variables: operation.request.variables,
    endpoint: client.endpoint,
  };

  const clientFetchOptions = await resolveFetchOptions(
    client.fetchOptions ?? {},
    fetchOperation
  );

  const operationFetchOptions = await resolveFetchOptions(
    operation.request.fetchOptions ?? {},
    fetchOperation
  );

  const fetchOptions = deepMerge(clientFetchOptions, operationFetchOptions);
  return {
    fetchOptions,
    ...fetchOperation,
  };
}

export const fetchExchange: Exchange = function fetchExchange({
  forward,
  client,
  dispatchDebug,
}) {
  return async (operation) => {
    if (
      operation.request.node.params.operationKind === "query" ||
      operation.request.node.params.operationKind === "mutation"
    ) {
      const fetchOperation = await createFetchOperation(operation, client);

      dispatchDebug({
        type: "fetchRequest",
        message: "fetching",
        operation,
        data: fetchOperation,
      });

      const result = await fetchGraphQL(fetchOperation);

      const error = !result.data ? result.error : undefined;

      dispatchDebug({
        type: error ? "fetchError" : "fetchSuccess",
        message: `${error ? "fetch failed" : "fetch successful"}`,
        operation,
        data: {
          ...fetchOperation,
          value: error || result,
        },
      });

      return {
        ...result,
        operation,
      };
    } else {
      return await forward(operation);
    }
  };
};
fetchExchange.emoji = "🚀";

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
