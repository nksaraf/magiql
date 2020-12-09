import { GraphQLClient } from "../client/client";
import { Exchange, Operation, Query, CombinedError } from "../types";

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
          name: "auth.error",
          data: result.combinedError,
          operation: operationWithAuth,
        });

        dispatchDebug({
          name: "auth.refresh.start",
          data: authState,
          operation: operationWithAuth,
        });
        authState = await refreshAuthState({ authState });

        if (authState) {
          dispatchDebug({
            name: "auth.refresh.success",
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
              name: "auth.failed",
              data: authState,
              operation: operationWithAuth,
            });
            onAuthFailed();
          }
        } else {
          dispatchDebug({
            name: "auth.failed",
            data: authState,
            operation: operationWithAuth,
          });
          onAuthFailed();
        }
      }

      return result;
    };
  };

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
