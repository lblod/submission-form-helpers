"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintsContainsCodelistValue;

var _namespaces = require("../namespaces");

/**
 * Checks if the supplied values contain the defined custom value.
 */
function constraintsContainsCodelistValue(values, options) {
  const {
    constraintUri,
    store,
    metaGraph
  } = options;
  const concept = store.any(constraintUri, (0, _namespaces.FORM)('customValue'), undefined);
  const conceptSchemeUri = store.any(constraintUri, (0, _namespaces.FORM)("conceptScheme"), undefined);
  const matchingValues = values.filter(value => {
    const matchCount = store.match(value, (0, _namespaces.SKOS)("inScheme"), conceptSchemeUri, metaGraph).length;
    return matchCount >= 1;
  });
  return matchingValues.map(value => value.value).includes(concept.value);
}