import { FORM, SHACL } from '../namespaces';
import rdflib from './../rdflib-shim.js';

export default function HasOneNumberGreaterThanInFields(field, options) {
  const {store, sourceGraph, formGraph, constraintUri} = options;

  const paths = store.match(constraintUri, SHACL('path'), undefined, formGraph);
  const values = paths.map(path => getValue(path.object, options));

  const threshold = store.any(constraintUri, FORM('threshold'), undefined, formGraph);

  let isValidGroup = false;
  values.forEach(value => {
    const isValidValue = isPositiveValue(value);
    if (isValidValue)
      isValidGroup = true;
  });

  return isValidGroup;
}

function getValue(predicate, options) {
  const entry = options.store.any(
      undefined,
      predicate,
      undefined,
      options.sourceGraph,
  );
  return entry && entry.value;
}

function isPositiveValue(value) {
  return parseInt(value) > 0;
}
