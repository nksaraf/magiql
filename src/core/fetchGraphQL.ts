import fetch from "isomorphic-unfetch";

import { getRequest } from "../relay-compile-tag/parser";
import type {
  ConcreteRequest,
  FetchOperation,
  FetchOptions,
  FetchResult,
  Query,
  Response,
  Variables,
} from "../types";
import { CombinedError } from "./error";

export type BaseVariables = { [key: string]: any };

export async function resolveFetchOptions<TVariables>(
  fetchOptions: FetchOptions<TVariables>,
  fetchOperation: Partial<FetchOperation<TVariables>>
) {
  return typeof fetchOptions === "function"
    ? await fetchOptions(fetchOperation as FetchOperation<TVariables>)
    : fetchOptions;
}

export interface RawFetchResponse<TQuery extends Query> {
  data: Response<TQuery> | null;
  errors?: any[];
  extensions: any;
}

export const makeResult = <TQuery extends Query>(
  result: Partial<RawFetchResponse<TQuery>>,
  response?: any
): FetchResult<TQuery> => ({
  data: result.data,
  combinedError: Array.isArray(result.errors)
    ? new CombinedError({
        graphQLErrors: result.errors,
        response,
      })
    : undefined,
  errors: (result.errors as any) ?? null,
  extensions:
    (typeof result.extensions === "object" && result.extensions) || undefined,
});

export const makeNetworkErrorResult = <TQuery extends Query>(
  error: Error,
  response?: any
): FetchResult<TQuery> => ({
  data: undefined,
  combinedError: new CombinedError({
    networkError: error,
    response,
  }),
  errors: [error],
  extensions: undefined,
});

export async function fetchGraphQL<TQuery extends Query>({
  endpoint,
  query: rawQuery,
  fetchOptions = () => ({}),
  variables = {},
  operationName = undefined,
  operationKind = "query",
}: FetchOperation<Variables<TQuery>>): Promise<FetchResult<TQuery>> {
  if (!rawQuery) {
    throw new Error("Query not found");
  }

  const query: string =
    typeof rawQuery === "string"
      ? rawQuery
      : getRequest(rawQuery as ConcreteRequest).params.text!;

  const operation = {
    endpoint,
    query,
    variables,
    operationName,
    operationKind,
  };

  const { headers = {}, ...options } = await resolveFetchOptions(
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

    console.log(response);
    if (!contentTypeHeader?.startsWith("application/json")) {
      const result = await response.text();
      return makeNetworkErrorResult(
        new Error(`Expected JSON response, received "${result}"`),
        response
      );
    } else if (!response.ok) {
      const result = await response.json();
      return makeResult(result, response);
    }

    const result: {
      data: Response<TQuery> | null;
      errors?: any[];
    } = await response.json();
    return makeResult(result, response);
  } catch (e) {
    return makeNetworkErrorResult(e);
  }
}
