"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidEmail;

/**
 * Checks if the given string is an valid email address.
 */
function constraintValidEmail(value) {
  let email = value.value;
  if (typeof email != 'string') return false;
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}