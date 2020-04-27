"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = singleInstanceTaxRateOrExtraTaxRate;

function singleInstanceTaxRateOrExtraTaxRate(values) {
  if (values.length && values.length > 1) return false;
  return true;
}