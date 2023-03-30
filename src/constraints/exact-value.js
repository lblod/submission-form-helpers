import { FORM } from "../namespaces.js";

/**
 * Checks if there is an exact value supplied
 */

export default function constraintExactValue(value, options) {
  const { constraintUri, store } = options;
  const expected = store.any(constraintUri, FORM("customValue"), undefined);

  if (Array.isArray(value)) {
    return value.length === 1 && value[0].value === expected.value;
  } else {
    return value.value == expected.value;
  }
}
