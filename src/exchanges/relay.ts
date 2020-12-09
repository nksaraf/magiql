import { makeNetworkErrorResult, makeResult } from "../fetch/fetchGraphQL";
import { Exchange, Operation, Query, FetchResult } from "../types";

export const relayExchange: Exchange = function relayExchange({
  client,
  forward,
  dispatchDebug,
}) {
  return async function <TQuery extends Query>(operation: Operation<TQuery>) {
    if (operation.request.node.params.operationKind === "query") {
      const promise = new Promise<FetchResult<TQuery>>((resolve, reject) => {
        const cacheConfig = {
          ...(operation.options.cacheConfig ?? {}),
          metadata: {
            ...(operation.options.cacheConfig?.metadata ?? {}),
            fetchOptions: operation.options.fetchOptions ?? {},
            operationName: operation.options.operationName,
          },
        };

        client.environment
          .execute({
            operation,
            cacheConfig,
            updater: operation.options.updater,
          })
          .subscribe({
            next: (response) => {
              resolve(response as FetchResult<TQuery>);
            },
            start: () => {
              dispatchDebug({
                name: "query.execute",
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
          });
      });

      const result: FetchResult<TQuery> = await promise;
      const error = !result.data ? result.combinedError : undefined;
      dispatchDebug({
        name: error ? "query.error" : "query.success",
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
      const promise = new Promise<FetchResult<TQuery>>((resolve, reject) => {
        const cacheConfig = {
          ...(operation.options.cacheConfig ?? {}),
          metadata: {
            ...(operation.options.cacheConfig?.metadata ?? {}),
            fetchOptions: operation.options.fetchOptions ?? {},
            operationName: operation.options.operationName,
          },
        };
        client.environment
          .executeMutation({
            operation,
            cacheConfig,
            optimisticResponse: operation.options.optimisticResponse
              ? typeof operation.options.optimisticResponse === "object"
                ? operation.options.optimisticResponse
                : (operation.options.optimisticResponse as any)?.(
                    operation.options.variables
                  )
              : undefined,
            optimisticUpdater: operation.options.optimisticUpdater
              ? (store) =>
                  operation.options.optimisticUpdater?.(
                    store,
                    operation.options.variables
                  )
              : undefined,
            updater: operation.options.updater,
          })
          .subscribe({
            next: (response) => {
              resolve(response as FetchResult<TQuery>);
            },
            start: () => {
              dispatchDebug({
                name: "mutation.execute",
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
          });
      });

      const result: FetchResult<TQuery> = await promise;
      const error = !result.data ? result.combinedError : undefined;
      dispatchDebug({
        name: error ? "mutation.error" : "mutation.success",
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
