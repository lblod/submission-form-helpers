"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintPositiveNumber;

/**
 * Checks if the given string is a positive number.
 */
function constraintPositiveNumber(value) {
  const number = Number(value.value);
  if (isNaN(number)) return false;
  return number >= 0;
}