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
