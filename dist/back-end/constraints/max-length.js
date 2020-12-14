"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintMaxLength;

var _namespaces = require("../namespaces");

/**
 * Checks if the given value is not longer than the given max length.
 */
function constraintMaxLength(value, options) {
  const {
    constraintUri,
    store
  } = options;
  const max = Number(store.any(constraintUri, (0, _namespaces.FORM)("max"), undefined).value) || 100000;

  switch (value.datatype.value) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
      return Number(value.value) <= max;

    case 'http://www.w3.org/2001/XMLSchema#decimal':
      return Number(value.value) <= max;

    case 'http://www.w3.org/2001/XMLSchema#string':
      return value.value.length <= max;

    default:
      console.log('Case not supported');
  }
}