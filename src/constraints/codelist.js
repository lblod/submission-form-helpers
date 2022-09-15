import { FORM, SKOS } from "../namespaces.js";

/**
 * Checks if the value comes from the supplied codelist.
 */
export default function validationsCodelist(value, options) {
  const { constraintUri, store, metaGraph } = options;
  const conceptSchemeUri = store.any(
    constraintUri,
    FORM("conceptScheme"),
    undefined
  );
  return (
    store.match(value, SKOS("inScheme"), conceptSchemeUri, metaGraph).length >=
    1
  );
}
