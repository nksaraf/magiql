/**
 * Shamelessly copied from the amazing `urql` client
 * https://github.com/FormidableLabs/urql/blob/main/packages/core/src/utils/error.ts
 */

import { GraphQLError } from "graphql/error/GraphQLError";

const generateErrorMessage = (
  networkErr?: Error,
  graphQlErrs?: GraphQLError[]
) => {
  let error = "";
  if (networkErr !== undefined) {
    return (error = `[Network] ${networkErr.message}`);
  }

  if (graphQlErrs !== undefined) {
    graphQlErrs.forEach((err) => {
      error += `[GraphQL] ${err.message}\n`;
    });
  }

  return error.trim();
};

const rehydrateGraphQlError = (error: any): GraphQLError => {
  if (typeof error === "string") {
    return new GraphQLError(error);
  } else if (typeof error === "object" && error.message) {
    return new GraphQLError(
      error.message,
      error.nodes,
      error.source,
      error.positions,
      error.path,
      error,
      error.extensions || {}
    );
  } else {
    return error as any;
  }
};

/** An error which can consist of GraphQL errors and Network errors. */
export class CombinedError extends Error {
  public name: string;
  public message: string;
  public graphQLErrors: GraphQLError[];
  public networkError?: Error;
  public response?: any;

  constructor({
    networkError,
    graphQLErrors,
    response,
  }: {
    networkError?: Error;
    graphQLErrors?: (string | Partial<GraphQLError> | Error)[];
    response?: any;
  }) {
    const normalizedGraphQLErrors = (graphQLErrors || []).map(
      rehydrateGraphQlError
    );
    const message = generateErrorMessage(networkError, normalizedGraphQLErrors);

    super(message);

    this.name = "CombinedError";
    this.message = message;
    this.graphQLErrors = normalizedGraphQLErrors;
    this.networkError = networkError;
    this.response = response;
  }

  toString() {
    return this.message;
  }
}
