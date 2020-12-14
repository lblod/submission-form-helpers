"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidPhoneNumber;

var _libphonenumberJs = _interopRequireDefault(require("libphonenumber-js"));

var _namespaces = require("../namespaces");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if the given string is an valid phone number.
 */
function constraintValidPhoneNumber(value, options) {
  const {
    constraintUri,
    store
  } = options;
  const defaultCountry = store.any(constraintUri, (0, _namespaces.FORM)("defaultCountry"), undefined).value || 'BE';
  const phoneNumber = (0, _libphonenumberJs.default)(value.value, defaultCountry);
  if (phoneNumber) return phoneNumber.isPossible();
  return false;
}