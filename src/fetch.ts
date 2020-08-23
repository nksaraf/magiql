import fetch from "isomorphic-unfetch";
import { getRequest, GraphQLTaggedNode } from "relay-runtime";

import { OperationKind, Query, Response, Variables } from "./types";

export type BaseVariables = { [key: string]: any };

export interface Options extends Omit<RequestInit, "body"> {
  headers?: Record<string, any>;
}

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
}

export interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
  status?: number;
}

export interface GraphQLRequestContext {
  query: string;
  variables?: BaseVariables;
}

function extractErrorMessage(response: any): string {
  if (response?.message) {
    return response.message;
  }
  if (response.errors && response.errors.length > 0) {
    return response.errors![0].message;
  }
  return `GraphQL Error (Code: ${response.status})`;
}

export class ClientError extends Error {
  response: GraphQLResponse;
  request: GraphQLRequestContext;

  constructor(
    response: GraphQLResponse | { message: string; status: number },
    request: GraphQLRequestContext
  ) {
    const message = extractErrorMessage(response);
    super(message);
    this.response = response;
    this.request = request;

    // this is needed as Safari doesn't support .captureStackTrace
    /* tslint:disable-next-line */
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, ClientError);
      console.log(this.stack);
    }
  }
}

export interface GraphQLOperation<TVariables> {
  query?: string | GraphQLTaggedNode;
  operationName?: string;
  operationKind?: OperationKind;
  variables?: TVariables;
  endpoint: string;
}

export type FetchOptionsFn<TVariables> = (
  operation: GraphQLOperation<TVariables>
) => Options;

export type FetchOptions<TVariables> = FetchOptionsFn<TVariables> | Options;

export interface FetchGraphQLOptions<TVariables>
  extends GraphQLOperation<TVariables> {
  fetchOptions?: FetchOptions<TVariables>;
}

export function resolveFetchOptions<TVariables>(
  fetchOptions: FetchOptions<TVariables>,
  operation: GraphQLOperation<TVariables>
) {
  return typeof fetchOptions === "function"
    ? fetchOptions(operation)
    : fetchOptions;
}

export async function fetchGraphQL<TQuery extends Query>({
  endpoint,
  query: rawQuery,
  fetchOptions = () => ({}),
  variables,
  operationName,
  operationKind = "query",
}: FetchGraphQLOptions<Variables<TQuery>>): Promise<Response<TQuery>> {
  if (!rawQuery) {
    throw new Error("Query not found");
  }

  const query: string =
    typeof rawQuery === "string"
      ? rawQuery
      : (getRequest(rawQuery) as any).query;

  const operation = {
    endpoint,
    query,
    variables,
    operationName,
    operationKind,
  };

  const { headers = {}, ...options } = resolveFetchOptions(
    fetchOptions,
    operation
  );

  const body = JSON.stringify({
    query,
    variables,
    operationName,
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body,
      ...options,
    });

    const contentTypeHeader = response.headers.get("Content-Type");

    if (!contentTypeHeader?.startsWith("application/json")) {
      const result = await response.text();
      throw new ClientError(
        { errors: [{ message: result }], status: response.status },
        operation
      );
    }

    const result: GraphQLResponse = await response.json();
    if (response.ok && !result.errors && result.data) {
      // const { headers, status } = response
      return result.data;
    } else {
      throw new ClientError({ ...result, status: response.status }, operation);
    }
  } catch (e) {
    if (e instanceof ClientError) {
      throw e;
    } else {
      throw new ClientError(
        { ...e, status: 404, message: e.message },
        operation
      );
    }
  }
}

export type FetchGraphql = typeof fetchGraphQL;
