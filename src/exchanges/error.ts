import {
  Exchange,



  CombinedError
} from "../types";


export const errorExchange = ({
  onError = (error: CombinedError) => {
    throw error;
  },
}) => {
  const errorExchange: Exchange = ({ forward }) => {
    return async (operation) => {
      const operationResult = await forward(operation);
      const { combinedError } = operationResult;
      if (combinedError) {
        onError(combinedError);
      }

      return operationResult;
    };
  };
  errorExchange.emoji = "❗";
  return errorExchange;
};
