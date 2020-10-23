import { makeResult } from "../fetch/fetchGraphQL";
import { Exchange, Operation, Query, FetchResult } from "../types";

export const relayExchange: Exchange = function relayExchange({
  client,
  forward,
  dispatchDebug,
}) {
  return async function <TQuery extends Query>(operation: Operation<TQuery>) {
    if (
      operation.request.node.params.operationKind === "query" ||
      operation.request.node.params.operationKind === "mutation"
    ) {
      const promise = new Promise<FetchResult<TQuery>>((resolve, reject) =>
        client.environment.execute({ operation }).subscribe({
          next: (response) => {
            resolve(response as FetchResult<TQuery>);
          },
          start: () => {
            dispatchDebug({
              type: "fetchRequest",
              message: "fetching",
              operation,
              data: {},
            });
          },
          error: (error) => {
            resolve(
              makeResult({
                data: null,
                errors: error.source.errors,
              })
            );
          },
        })
      );

      const result: FetchResult<TQuery> = await promise;
      const error = !result.data ? result.combinedError : undefined;
      dispatchDebug({
        type: error ? "fetchError" : "fetchSuccess",
        message: `${error ? "fetch failed" : "fetch successful"}`,
        operation,
        data: {
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
relayExchange.emoji = "🏃";
