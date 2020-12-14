"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidUri;

var _validator = _interopRequireDefault(require("validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if it is a valid uri
 */
function constraintValidUri(value
/*, options*/
) {
  return _validator.default.isURL(value.value);
}