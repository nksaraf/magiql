import { Exchange } from "../types";


export const normalizerExchange: Exchange = ({
  forward,
  client,
  dispatchDebug,
}) => {
  return async (operation) => {
    const result = await forward(operation);
    const { data } = result;
    const normalizedData = client.normalizer
      ? client.normalizer.normalizeResponse(data, operation)
      : data;

    dispatchDebug({
      type: "normalize",
      message: "normalized response",
      operation,
      data: {
        raw: data,
        normalized: normalizedData,
      },
    });

    return {
      ...result,
      extensions: {
        normalizedData,
      },
    };
  };
};
normalizerExchange.emoji = "🗃";
