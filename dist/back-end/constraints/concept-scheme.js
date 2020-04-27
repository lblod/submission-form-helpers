"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = conceptSchemeValidation;

var _namespaces = require("../namespaces");

function conceptSchemeValidation(values, options) {
  if (!values.length) return true; //TODO: ASSUMES BAG MATCHING, FIX PLEASE

  const {
    constraintUri,
    store,
    metaGraph
  } = options;
  const matchingType = store.match(constraintUri, (0, _namespaces.FORM)("grouping"), undefined)[0].object.value;

  if (matchingType == 'http://lblod.data.gift/vocabularies/forms/Bag') {
    const conceptSchemeUri = store.match(constraintUri, (0, _namespaces.FORM)("conceptScheme"), undefined)[0].object;
    const matchingValues = values.filter(value => {
      return store.match(value, (0, _namespaces.SKOS)("inScheme"), conceptSchemeUri, metaGraph).length;
    });
    return matchingValues.length == 1;
  } else {
    console.log('matching type for concept scheme selector is not form:Bag, please change that');
    return false;
  }
}