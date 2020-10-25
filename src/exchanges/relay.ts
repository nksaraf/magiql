import { makeNetworkErrorResult, makeResult } from "../fetch/fetchGraphQL";
import { Exchange, Operation, Query, FetchResult } from "../types";

export const relayExchange: Exchange = function relayExchange({
  client,
  forward,
  dispatchDebug,
}) {
  return async function <TQuery extends Query>(operation: Operation<TQuery>) {
    if (operation.request.node.params.operationKind === "query") {
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
            if (error.source) {
              resolve(
                makeResult({
                  data: null,
                  errors: error.source.errors,
                })
              );
            } else {
              resolve(makeNetworkErrorResult(error));
            }
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
    } else if (operation.request.node.params.operationKind === "mutation") {
      const promise = new Promise<FetchResult<TQuery>>((resolve, reject) =>
        client.environment
          .executeMutation({
            operation,
            cacheConfig: operation.options.cacheConfig ?? {},
            optimisticResponse: operation.options.optimisticResponse
              ? typeof operation.options.optimisticResponse === "object"
                ? operation.options.optimisticResponse
                : (operation.options.optimisticResponse as any)(
                    operation.options.variables
                  )
              : undefined,
            optimisticUpdater: operation.options.optimisticUpdater,
            updater: operation.options.updater,
          })
          .subscribe({
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
