import { fetchGraphQL, resolveFetchOptions } from "../fetchGraphQL";
import { OperationKind, Exchange, Operation, Query, FetchOperation, Variables } from "../types";
import deepMerge from "deepmerge";
import { GraphQLClient } from "../client";
export async function createFetchOperation<TQuery extends Query>(operation: Operation<TQuery>, client: GraphQLClient): Promise<FetchOperation<Variables<TQuery>>> {
    const fetchOperation = {
        query: operation.request.node,
        operationName: operation.request.node.params.name,
        operationKind: operation.request.node.params.operationKind as OperationKind,
        variables: operation.request.variables,
        endpoint: client.endpoint,
    };
    const clientFetchOptions = await resolveFetchOptions(client.fetchOptions ?? {}, fetchOperation);
    const operationFetchOptions = await resolveFetchOptions(operation.request.fetchOptions ?? {}, fetchOperation);
    const fetchOptions = deepMerge(clientFetchOptions, operationFetchOptions);
    return {
        fetchOptions,
        ...fetchOperation,
    };
}
export const fetchExchange: Exchange = function fetchExchange({ forward, client, dispatchDebug, }) {
    return async (operation) => {
        if (operation.request.node.params.operationKind === "query" ||
            operation.request.node.params.operationKind === "mutation") {
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
        }
        else {
            return await forward(operation);
        }
    };
};
fetchExchange.emoji = "🚀";
