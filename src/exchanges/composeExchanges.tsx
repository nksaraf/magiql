/**
 * Concept copied from the amazing `urql` client (without using streams)
 * https://github.com/FormidableLabs/urql/blob/main/packages/core/src/exchanges
 */

import type {
  Exchange,
  ExchangeInput,
  Operation,
  Query,
  CombinedError,
} from "../types";
import type { GraphQLClient } from "../client";

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



