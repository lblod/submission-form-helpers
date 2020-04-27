"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidDate;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Checks if the given string is an valid date format conform to xsd:date.
 * Expected date format ex: 01-01-2020
 */
function constraintValidDate(value
/*, options*/
) {
  if (value.datatype.value !== "http://www.w3.org/2001/XMLSchema#date") {
    return false;
  }

  let dateString = value.value;

  if ((0, _moment.default)(dateString, "YYYY-MM-DD", true).isValid()) {
    return true;
  } else {
    return false;
  }
}