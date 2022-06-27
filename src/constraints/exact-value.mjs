import { FORM } from '../namespaces.mjs';

/**
 * Checks if there is an exact value supplied
 */

export default function constraintExactValue(value, options) {
  const { constraintUri, store } = options;
  const expected = store.any( constraintUri, FORM("customValue"), undefined );
  return value.value == expected.value;
}
