import { FetchResult, Operation, Query as IQuery } from "../types";
import { Environment } from "relay-runtime";
import { CombinedError } from "./error";
import { makeNetworkErrorResult, makeResult } from "./fetchGraphQL";

export function executeQuery<TQuery extends IQuery>(
  environment: Environment,
  operation: Operation<TQuery>,
  {
    onStart,
    onError,
    onSuccess,
    onSettled,
  }: {
    onStart?: () => void;
    onError?: (error?: CombinedError) => void;
    onSuccess?: (result: FetchResult<TQuery>) => void;
    onSettled?: (result: FetchResult<TQuery>, error?: CombinedError) => void;
  } = {}
): Promise<FetchResult<TQuery>> {
  return new Promise((resolve, reject) => {
    environment.execute({ operation }).subscribe({
      next: (response) => {
        const result = makeResult<TQuery>(response as any);
        onSuccess?.(result);
        onSettled?.(result, result.combinedError);
        resolve(result);
      },
      start: () => {
        onStart?.();
      },
      error: (error) => {
        try {
          const errors = JSON.parse(error.res.text);
          if (errors.errors) {
            resolve(makeResult({ data: null, ...errors }));
          } else {
            resolve(makeNetworkErrorResult(error, error.res));
          }
        } catch (e) {
          resolve(makeNetworkErrorResult(error, error.res));
        }
      },
    });
  });
}

export const executeMutation = <TMutation extends IQuery>(
  environment: Environment,
  operation: Operation<TMutation>
) => {
  return new Promise<FetchResult<TMutation>>((resolve, reject) => {
    // const cacheConfig = {
    //   ...(operation.options.cacheConfig ?? {}),
    //   metadata: {
    //     ...(operation.options.cacheConfig?.metadata ?? {}),
    //     fetchOptions: operation.options.fetchOptions ?? {},
    //     operationName: operation.options.operationName,
    //   },
    // };
    environment
      .executeMutation({
        operation,
        // cacheConfig,
        // optimisticResponse: operation.options.optimisticResponse
        //   ? typeof operation.options.optimisticResponse === "object"
        //     ? operation.options.optimisticResponse
        //     : (operation.options.optimisticResponse as any)?.(
        //         operation.options.variables
        //       )
        //   : undefined,
        // optimisticUpdater: operation.options.optimisticUpdater
        //   ? (store) =>
        //       operation.options.optimisticUpdater?.(
        //         store,
        //         operation.options.variables
        //       )
        //   : undefined,
        // updater: operation.options.updater,
      })
      .subscribe({
        next: (response) => {
          resolve(makeResult(response as FetchResult<TMutation>));
        },
        start: () => {
          // dispatchDebug({
          //   name: "mutation.execute",
          //   operation,
          //   data: {},
          // });
        },
        error: (error) => {
          try {
            const errors = JSON.parse(error.res.text);
            if (errors.errors) {
              resolve(makeResult({ data: null, ...errors }));
            } else {
              resolve(makeNetworkErrorResult(error, error.res));
            }
          } catch (e) {
            resolve(makeNetworkErrorResult(error, error.res));
          }
        },
      });
  });
};
