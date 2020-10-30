import { Exchange } from "../types";

export const storeExchange: Exchange = ({ forward, dispatchDebug, client }) => {
  return async (operation) => {
    const result = await forward(operation);
    const { data } = result;

    if (!data) {
      return result;
    }

    if (client.store.isNormalized) {
      if (!client.normalizer) {
        throw new Error("Normalizer not provided");
      }
      const normalizedData = client.normalizer.normalizeResponse(
        data,
        operation
      );

      dispatchDebug({
        name: "store.normalize",
        message: "normalized response",
        operation,
        data: {
          raw: data,
          normalized: normalizedData,
        },
      });

      client.store.update(result.extensions?.normalizedData);

      dispatchDebug({
        name: "store.commit",
        message: "commited to store",
        operation,
        data: result.extensions?.normalizedData,
      });

      return {
        ...result,
        extensions: {
          normalizedData,
        },
      };
    } else {
      return result;
    }
  };
};
storeExchange.emoji = "🗄";
