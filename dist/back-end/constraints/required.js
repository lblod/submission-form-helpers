"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintsRequired;

function constraintsRequired(values
/*, options*/
) {
  return values.length > 0 && true || false;
}