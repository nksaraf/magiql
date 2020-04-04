import unfetch from "isomorphic-unfetch";

export interface Headers {
  [key: string]: string;
}

export interface FetchOptions {
  method?: "GET" | "POST" | "DELETE" | "PATCH" | "PUT" | "HEAD" | "OPTIONS" | "CONNECT";
  headers?: Headers;
  body?: any;
  mode?: "cors" | "no-cors" | "same-origin";
  credentials?: "omit" | "same-origin" | "include";
  cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
  redirect?: "follow" | "error" | "manual";
  referrer?: string;
  referrerPolicy?: "referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "unsafe-url";
  integrity?: any;
}

export enum ResponseType {
  Basic,
  Cors,
  Default,
  Error,
  Opaque
}

export interface ResponseHeaders {
  append(name: string, value: string):void;
  delete(name: string):void;
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


interface Window  {
  fetch: Fetch
}

export const fetch : Fetch = (unfetch as unknown as Fetch);