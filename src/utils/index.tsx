export function throwError() {
  return () => {
    throw new Error("unimplemented");
  };
}

export function assertBabelPlugin(condition: any) {
  if (!condition) {
    throw new Error("use babel plugin");
  }
}

export const isServer = typeof window === "undefined";

export function noop(): void {
  return void 0;
}

export * from "./stringify";
