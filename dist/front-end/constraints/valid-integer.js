"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidInteger;

/**
 * Checks if the given string is an valid integer format conform to xsd:integer.
 */
function constraintValidInteger(value) {
  // NOTE: we can not guaranty that this is always the case.
  // if (value.datatype.value !== 'http://www.w3.org/2001/XMLSchema#integer') {
  //   return false;
  // }
  const number = Number(value.value);
  return Number.isInteger(number) && Number.isSafeInteger(number);
}