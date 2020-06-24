import unfetch from "isomorphic-unfetch";

export interface Headers {
  [key: string]: string;
}

export interface FetchOptions {
  method?:
    | "GET"
    | "POST"
    | "DELETE"
    | "PATCH"
    | "PUT"
    | "HEAD"
    | "OPTIONS"
    | "CONNECT";
  headers?: Headers;
  body?: any;
  mode?: "cors" | "no-cors" | "same-origin";
  credentials?: "omit" | "same-origin" | "include";
  cache?:
    | "default"
    | "no-store"
    | "reload"
    | "no-cache"
    | "force-cache"
    | "only-if-cached";
  redirect?: "follow" | "error" | "manual";
  referrer?: string;
  referrerPolicy?:
    | "referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "unsafe-url";
  integrity?: any;
}

export enum ResponseType {
  Basic,
  Cors,
  Default,
  Error,
  Opaque,
}

export interface ResponseHeaders {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string;
  getAll(name: string): Array<string>;
  has(name: string): boolean;
  set(name: string, value: string): void;
}

export interface ResponseBody {
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<JSON>;
  text(): Promise<string>;
}

export interface Response extends ResponseBody {
  error(): Response;
  redirect(url: string, status?: number): Response;
  type: ResponseType;
  url: string;
  status: number;
  ok: boolean;
  statusText: string;
  headers: ResponseHeaders;
  clone(): Response;
}

type Fetch = (url: string, options?: FetchOptions) => Promise<Response>;

interface Window {
  fetch: Fetch;
}

export const fetch: Fetch = (unfetch as unknown) as Fetch;

export type Variables = { [key: string]: any };

export interface Options extends Omit<FetchOptions, "body"> {}

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
    const message = ClientError.extractMessage(response);
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

async function baseFetchGraphQL<TData, TVariables>(
  uri: string,
  query: string,
  variables: TVariables = {} as any,
  options: Options = {}
): Promise<TData> {
  const { headers, ...others } = options;
  // const printedQuery = print(query);

  const body = JSON.stringify({
    query,
    variables: variables,
  });
  try {
    const response = await fetch(uri, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, headers),
      body,
      ...others,
    });

    const result: string | GraphQLResponse = (await (response.headers
      .get("Content-Type")
      ?.startsWith("application/json")
      ? response.json()
      : response.text())) as any;

    if (
      response.ok &&
      typeof result !== "string" &&
      !result.errors &&
      result.data
    ) {
      // const { headers, status } = response
      return result.data;
    } else {
      const errorResult =
        typeof result === "string" ? { error: result } : result;
      throw new ClientError(
        { ...errorResult, status: response.status },
        { query, variables }
      );
    }
  } catch (e) {
    if (e instanceof ClientError) {
      throw e;
    } else {
      throw new ClientError({ ...e, status: "400" }, { query, variables });
    }
  }
}

export interface FetchGraphql<TData, TVariables> {
  (
    uri: string,
    query: string,
    variables?: TVariables,
    options?: Options & { middleware?: Middleware<TData, TVariables>[] }
  ): Promise<TData>;
}

export const fetchGraphQL = async <TData, TVariables>(
  uri: string,
  query: string,
  variables?: TVariables,
  {
    middleware = [],
    ...options
  }: Options & { middleware?: Middleware<TData, TVariables>[] } = {}
): Promise<TData> => {
  const result = await applyMiddleware<TData, TVariables>(
    baseFetchGraphQL,
    middleware
  )(uri, query, variables, options);
  return result;
};

export interface Middleware<TData, TVariables> {
  (fetch: FetchGraphql<TData, TVariables>): FetchGraphql<TData, TVariables>;
}

export const applyMiddleware = <TData, TVariables>(
  fn: FetchGraphql<TData, TVariables>,
  middleware: Middleware<TData, TVariables>[]
): FetchGraphql<TData, TVariables> => {
  return middleware.reduce((agg, m) => {
    return m(agg);
  }, fn);
};
