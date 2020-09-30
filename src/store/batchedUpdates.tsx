export let batchedUpdates: (callback: () => any) => void;

export function setBatch(batchedUpdatesFn: typeof batchedUpdates) {
  batchedUpdates = batchedUpdatesFn;
}
