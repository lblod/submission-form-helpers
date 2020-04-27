"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validBoolean;

function validBoolean(value) {
  if (value.datatype.value !== "http://www.w3.org/2001/XMLSchema#boolean") {
    return false;
  }

  return true;
}