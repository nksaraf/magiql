
export const isServer = typeof window === "undefined";

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


