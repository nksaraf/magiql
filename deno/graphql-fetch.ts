/// <reference lib="dom" />

export type Variables = { [key: string]: any };

export interface Options extends Omit<RequestInit, "body"> {}

export interface GraphQLError {
  message: string;
  locations: { line: number; column: number }[];
  path: string[];
}

export interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
  status: number;
}

export interface GraphQLRequestContext {
  query: string;
  variables?: Variables;
}

export class ClientError extends Error {
  response: GraphQLResponse;
  request: GraphQLRequestContext;

  constructor(response: GraphQLResponse, request: GraphQLRequestContext) {
    const message = ClientError.extractMessage(response)
    // JSON.stringify({
    //   response,
    //   request
    // })}`;

    super(message);
    this.response = response;
    this.request = request;

    // this is needed as Safari doesn't support .captureStackTrace
    /* tslint:disable-next-line */
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, ClientError);
    }
  }

  private static extractMessage(response: GraphQLResponse): string {
    try {
      return response.errors![0].message;
    } catch (e) {
      return `GraphQL Error (Code: ${response.status})`;
    }
  }
}

async function baseFetchGraphQL<TData extends any, TVariables extends { [key: string]: any }>(
  uri: string,
  query: string,
  variables: TVariables = {} as any,
  options: Options = {}
): Promise<TData> {
  const { headers, ...others } = options;
  // const printedQuery = print(query);

  const body = JSON.stringify({
    query,
    variables: variables
  });
  try {
    const response = await fetch(uri, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, headers),
      body,
      ...others
    });
  
    const result : string | GraphQLResponse = await (response.headers
      .get("Content-Type")
      ?.startsWith("application/json")
      ? response.json()
      : response.text()) as any;
  
    if (response.ok && typeof result !==  "string" && !result.errors && result.data) {
      // const { headers, status } = response
      return result.data;
    } else {
      const errorResult = typeof result === "string" ? { error: result } : result;
      throw new ClientError(
        { ...errorResult, status: response.status },
        { query, variables }
      );
    }
  } catch (e) {
    if (e instanceof ClientError) {
      throw e;
    } else {
      throw new ClientError(
        { ...e, status: '400' },
        { query, variables }
      )
    }
  }
}

export async function fetchGraphQL<T extends any, V extends object>(
  uri: string,
  query: string,
  variables?: V,
  { middleware = [], ...options }: Options & { middleware?: Middleware[] } = {}
): Promise<T> {
  const result = await ((applyMiddleware(baseFetchGraphQL, middleware))(
    uri,
    query,
    variables,
    options
  ));
  return result;
}

export interface Middleware {
  (fetch: typeof fetchGraphQL): typeof fetchGraphQL;
}

export const applyMiddleware = (
  fn: typeof fetchGraphQL,
  middleware: Middleware[]
) => {
  return middleware.reduce((agg, m) => {
    return m(agg);
  }, fn);
};


