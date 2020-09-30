import {
  Store,
  Exchange
} from "../types";


export const storeExchange = (store: Store) => {
  const storeExchange: Exchange = ({ forward, dispatchDebug }) => {
    return async (operation) => {
      const result = await forward(operation);
      if (result.extensions?.normalizedData && store.type === "normalized") {
        store.commit(operation, result.extensions?.normalizedData);
        dispatchDebug({
          type: "commit",
          message: "commited to store",
          operation,
          data: result.extensions?.normalizedData,
        });
      } else if (store.type === "normalized") {
        throw new Error("Normalized store expects normalized data");
      } else {
        store.commit(operation, result.data);
        dispatchDebug({
          type: "commit",
          message: "commited to store",
          operation,
          data: result.data,
        });
      }

      return result;
    };
  };
  storeExchange.emoji = "🗄";
  return storeExchange;
};
