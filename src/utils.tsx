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

function stableStringifyReplacer(_key: string, value: any): unknown {
  if (typeof value === "function") {
    throw new Error();
  }

  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = value[key];
        return result;
      }, {} as any);
  }

  return value;
}

export const stringifyData = (data: any) => {
  return JSON.stringify(
    data,
    (old, value) =>
      old === "__fragmentOwner"
        ? undefined
        : old === "__fragments"
        ? Object.keys(value)
        : value,
    2
  );
};

export function stableStringify(value: any): string {
  return JSON.stringify(value, stableStringifyReplacer);
}

// Copied from: https://github.com/jonschlinkert/is-plain-object
export function isPlainObject(o: any): o is Object {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor === "undefined") {
    return true;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

function hasObjectPrototype(o: any): boolean {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export function isError(value: any): value is Error {
  return value instanceof Error;
}

export const memoized = <T extends any[], V>(
  fn: (...args: T) => V,
  serialize: (...args: T) => string
) => {
  const cache: { [key: string]: V } = {};
  return (...vars: T) => {
    const key = serialize(...vars);
    if (cache[key]) {
      return cache[key];
    } else {
      const val = fn(...vars);
      if (val) {
        cache[key] = val;
      }
      return val;
    }
  };
};
