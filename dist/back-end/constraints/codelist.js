"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validationsCodelist;

var _namespaces = require("../namespaces");

/**
 * Checks if the value comes from the supplied codelist.
 */
function validationsCodelist(value, options) {
  const {
    constraintUri,
    store,
    metaGraph
  } = options;
  const conceptSchemeUri = store.any(constraintUri, (0, _namespaces.FORM)("conceptScheme"), undefined);
  return store.match(value, (0, _namespaces.SKOS)("inScheme"), conceptSchemeUri, metaGraph).length >= 1;
}