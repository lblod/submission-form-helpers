"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidUri;

/**
 * Checks if it is a valid uri
 */
function constraintValidUri(value
/*, options*/
) {
  return value.value.match(/^(http|ftp)s?:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/);
}