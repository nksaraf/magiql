import { fetchGraphQL, resolveFetchOptions } from "./fetch";
import { OperationKind, Store, Exchange, ExchangeInput } from "./types";

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
            source: exchange.name,
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
}): Exchange =>
  function errorExchange({ forward, client }) {
    return async (operation) => {
      const operationResult = await forward(operation);
      const { error } = operationResult;
      if (error) {
        onError(error);
      }

      return operationResult;
    };
  };

export const fallbackExchange: Exchange = function fallbackExchange() {
  return async () => {
    throw new Error("operation is not supported");
  };
};

export const debugExchange: Exchange = function debugExchange({
  forward,
  client,
}) {
  return async (operation) => {
    console.log(
      "🚀",
      operation.request.node.params.name,
      JSON.stringify(operation.request.variables)
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

export const fetchExchange: Exchange = function fetchExchange({
  forward,
  client,
  dispatchDebug,
}) {
  return async (operation) => {
    const fetchOperation = {
      query: operation.request.node.params.text!,
      operationName: operation.request.node.params.name,
      operationKind: operation.request.node.params
        .operationKind as OperationKind,
      variables: operation.request.variables,
      endpoint: client.endpoint,
    };

    const fetchOptions = await resolveFetchOptions(
      client.fetchOptions,
      fetchOperation
    );

    dispatchDebug({
      type: "fetchRequest",
      message: "A fetch request is being executed.",
      operation,
      data: {
        endpoint: client.endpoint,
        fetchOptions,
      },
    });

    const result = await fetchGraphQL({
      ...fetchOperation,
      fetchOptions,
    });

    const error = !result.data ? result.error : undefined;

    dispatchDebug({
      type: error ? "fetchError" : "fetchSuccess",
      message: `A ${
        error ? "failed" : "successful"
      } fetch response has been returned.`,
      operation,
      data: {
        endpoint: client.endpoint,
        fetchOptions,
        value: error || result,
      },
    });

    return {
      ...result,
      operation,
    };
  };
};
export const storeExchange = (store: Store): Exchange =>
  function storeExchange({ forward, client, dispatchDebug }) {
    return async (operation) => {
      const result = await forward(operation);
      store.commit(operation, result.data);
      dispatchDebug({
        type: "commit",
        message: "Data committed to store",
        operation,
        data: result.data,
      });
      return result;
    };
  };
