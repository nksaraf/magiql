import { fetchGraphQL, resolveFetchOptions } from "./fetch";
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
import { GraphQLClient } from "./client";

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
  onError,
}: {
  onError: (error: Error) => void;
}): Exchange => {
  function errorExchange({ forward, client }) {
    return async (operation) => {
      const operationResult = await forward(operation);
      const { error } = operationResult;
      if (error) {
        onError(error);
      }

      return operationResult;
    };
  }
  errorExchange.emoji = "❗";
  return errorExchange;
};

export const fallbackExchange: Exchange = function fallbackExchange() {
  return async () => {
    throw new Error("operation is not supported");
  };
};

// export const debugExchange: Exchange = function debugExchange({
//   forward,
//   client,
// }) {
//   return async (operation) => {
//     console.log(
//       "🚀",
//       operation.request.node.params.name,
//       JSON.stringify(operation.request.variables)
//     );
//     const operationResult = await forward(operation);
//     console.log(
//       "📦",
//       operation.request.node.params.name,
//       JSON.stringify(operation.request.variables),
//       ...[operationResult.data && "success", operationResult.error].filter(
//         Boolean
//       )
//     );
//     return operationResult;
//   };
// };

export async function createFetchOperation<TQuery extends Query>(
  operation: Operation<TQuery>,
  client: GraphQLClient
): Promise<FetchOperation<Variables<TQuery>>> {
  const fetchOperation = {
    query: operation.request.node.params.text!,
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
  };
};
fetchExchange.emoji = "🚀";

export const storeExchange = (store: Store): Exchange => {
  function storeExchange({ forward, client, dispatchDebug }) {
    return async (operation) => {
      const result = await forward(operation);
      store.commit(operation, result.data);
      dispatchDebug({
        type: "commit",
        message: "commited to store",
        operation,
        data: result.data,
      });
      return result;
    };
  }
  storeExchange.emoji = "🗄 ";
  return storeExchange;
};

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
  function authExchange({ client, forward, dispatchDebug }) {
    return async (operation) => {
      // const tokens = getAuthTokens();
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
  }
  authExchange.emoji = "🔓";
  return authExchange;
}
