import { createFetchOperation, fetchGraphQL } from "../fetch/fetchGraphQL";
import { Exchange } from "../types";

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
      const fetchOperation = await createFetchOperation(
        {
          ...operation.request.node.params,
          metadata: {
            ...operation.request.node.params.metadata,
            fetchOptions: operation.options.fetchOptions,
          },
        },
        operation.request.variables,
        client.endpoint,
        [client.fetchOptions]
      );

      dispatchDebug({
        name: "fetch.start",
        message: "fetching",
        operation,
        data: fetchOperation,
      });

      const result = await fetchGraphQL(fetchOperation);

      const error = !result.data ? result.combinedError : undefined;

      dispatchDebug({
        name: error ? "fetch.error" : "fetch.success",
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
