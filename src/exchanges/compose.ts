/**
 * Concept copied from the amazing `urql` client (without using streams)
 * https://github.com/FormidableLabs/urql/blob/main/packages/core/src/exchanges
 */

import type {
  Exchange,
  ExchangeInput,
} from "../types";

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
            source: exchange.emoji,
            ...event,
          });
        },
      }),
    forward
  );

export const fallbackExchange: Exchange = function fallbackExchange() {
  return async () => {
    throw new Error("operation is not supported");
  };
};
fallbackExchange.emoji = "❓";




