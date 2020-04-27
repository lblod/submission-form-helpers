"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintsSingleCodelistValue;

var _namespaces = require("../namespaces");

/**
 * Checks if there is only a single value coming from the supplied codelist
 */
function constraintsSingleCodelistValue(values, options) {
  const {
    constraintUri,
    store,
    metaGraph
  } = options;
  const conceptSchemeUri = store.any(constraintUri, (0, _namespaces.FORM)("conceptScheme"), undefined);
  const concept = store.any(constraintUri, (0, _namespaces.FORM)("customValue"), undefined);
  const matchingValues = values.filter(value => {
    const matchCount = store.match(value, (0, _namespaces.SKOS)("inScheme"), conceptSchemeUri, metaGraph).length;
    return matchCount >= 1;
  });
  return matchingValues.length == 1 && matchingValues[0].value == concept.value;
}