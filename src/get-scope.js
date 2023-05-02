import { FORM } from "./namespaces.js";

export function getScope(field, options) {
  const { store, formGraph } = options;
  const scope = store.any(field, FORM("scope"), undefined, formGraph);
  return scope;
}
