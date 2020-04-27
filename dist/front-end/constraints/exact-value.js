"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintExactValue;

var _namespaces = require("../namespaces");

/**
 * Checks if there is an exact value supplied
 */
function constraintExactValue(value, options) {
  const {
    constraintUri,
    store
  } = options;
  const expected = store.any(constraintUri, (0, _namespaces.FORM)("customValue"), undefined);
  return value.value == expected.value;
}