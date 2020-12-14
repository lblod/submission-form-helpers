"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidIBAN;

var _iban = _interopRequireDefault(require("iban"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if the given string is an valid IBAN.
 */
function constraintValidIBAN(value) {
  const iban = value.value;
  if (typeof iban != 'string') return false;
  return _iban.default.isValid(iban);
}