import { Exchange } from "../types";
export const fallbackExchange: Exchange = function fallbackExchange() {
    return async () => {
        throw new Error("operation is not supported");
    };
};
fallbackExchange.emoji = "❓";
