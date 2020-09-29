export const PREFIX = "client:";

export function generateClientID(
  id: string,
  storageKey: string,
  index?: number
): string {
  let key = id + ":" + storageKey;
  if (index != null) {
    key += ":" + index;
  }
  if (key.indexOf(PREFIX) !== 0) {
    key = PREFIX + key;
  }
  return key;
}
