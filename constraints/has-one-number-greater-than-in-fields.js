import { FORM, SHACL } from '../namespaces';
import rdflib from "./../rdflib-shim.js";

export default function hasOnePositiveNumberInFields(field, options) {
  const { store, sourceGraph, formGraph, constraintUri } = options;

  const constraint = store.any(constraintUri, FORM('validations'), undefined, formGraph);
  const paths = store.match(constraintUri, SHACL('path'), undefined, formGraph);
  const values = paths.map(path => getValue(store, sourceGraph, path.object).value);

  const threshold = store.any(constraintUri, FORM('threshold'), undefined, formGraph);

  let isValidGroup = false;
  values.forEach(value => {
    const isValidValue = isPositiveValue(value);
    if (isValidValue)
      isValidGroup = true;
  })
  
  return isValidGroup;
}

function getValue(store, sourceGraph, predicate) {
  const entry = store.match(
    undefined,
    predicate,
    undefined,
    sourceGraph
  )[0];
  if (entry && entry.object)
    return entry.object;
  return null;
}

function isPositiveValue(value) {
  return parseInt(value) > 0;
}
