import { Exchange, Operation, Query, CombinedError } from "../types";
import { GraphQLClient } from "../core/graphQLClient";

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
        result.combinedError &&
        didAuthError &&
        didAuthError({ error: result.combinedError })
      ) {
        dispatchDebug({
          type: "authError",
          message: "auth error",
          data: result.combinedError,
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
            result.combinedError &&
            didAuthError &&
            didAuthError({ error: result.combinedError })
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
