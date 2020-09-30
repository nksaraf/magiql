import { Exchange, CombinedError } from "../types";
export const errorExchange = ({ onError = (error) => {
    throw error;
}, }: {
    onError?: (error: CombinedError) => void;
}) => {
    const errorExchange: Exchange = ({ forward }) => {
        return async (operation) => {
            const operationResult = await forward(operation);
            const { error } = operationResult;
            if (error) {
                onError(error);
            }
            return operationResult;
        };
    };
    errorExchange.emoji = "❗";
    return errorExchange;
};
