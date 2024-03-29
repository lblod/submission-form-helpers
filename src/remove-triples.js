import { triplesForPath } from "./triples-for/triples-for-path.js";

/**
 * Removes all triples for the given options
 * HARD RESET
 */
export function removeTriples(options) {
  const { store } = options;

  const dataset = triplesForPath(options, true);
  store.removeStatements(dataset.triples);
}
