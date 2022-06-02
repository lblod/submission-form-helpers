"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = HasOneNumberGreaterThanInFields;

var _namespaces = require("../namespaces");

var _rdflibShim = _interopRequireDefault(require("./../rdflib-shim.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function HasOneNumberGreaterThanInFields(field, options) {
  const paths = options.store.match(options.constraintUri, (0, _namespaces.SHACL)('path'), undefined, options.formGraph);
  const values = paths.map(path => getValue(path.object, options));
  const threshold = options.store.any(options.constraintUri, (0, _namespaces.FORM)('threshold'), undefined, options.formGraph);
  let isValidGroup = false;
  values.forEach(value => {
    const isValidValue = isGreaterThan(value, threshold);
    if (isValidValue) isValidGroup = true;
  });
  return isValidGroup;
}

function getValue(predicate, options) {
  const entry = options.store.any(options.sourceNode, predicate, undefined, options.sourceGraph);
  return entry && entry.value;
}

function isGreaterThan(value, threshold) {
  return parseInt(value) > parseInt(threshold);
}