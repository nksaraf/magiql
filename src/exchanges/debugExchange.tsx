import { Exchange } from "../types";
export const debugExchange: Exchange = function debugExchange({ forward }) {
    return async (operation) => {
        console.log("🚀", operation.request.node.params.name, JSON.stringify(operation.request.variables), "fetching");
        const operationResult = await forward(operation);
        console.log("📦", operation.request.node.params.name, JSON.stringify(operation.request.variables), ...[operationResult.data && "success", operationResult.error].filter(Boolean));
        return operationResult;
    };
};
