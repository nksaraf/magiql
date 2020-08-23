export let batchedUpdates: <A, B>(
  callback: (a: A, b: B) => any,
  a?: A,
  b?: B
) => void;

export function setBatch(batchedUpdatesFn: typeof batchedUpdates) {
  batchedUpdates = batchedUpdatesFn;
}
