import { FORM, SHACL } from '../namespaces';
import rdflib from 'rdflib';

export default function HasOneNumberGreaterThanInFields(field, options) {
  const paths = options.store.match(options.constraintUri, SHACL('path'), undefined, options.formGraph);
  const values = paths.map(path => getValue(path.object, options));
  const threshold = options.store.any(options.constraintUri, FORM('threshold'), undefined, options.formGraph);

  let isValidGroup = false;
  values.forEach(value => {
    const isValidValue = isGreaterThan(value, threshold);
    if (isValidValue)
      isValidGroup = true;
  });

  return isValidGroup;
}

function getValue(predicate, options) {
  const entry = options.store.any(
      options.sourceNode,
      predicate,
      undefined,
      options.sourceGraph,
  );
  return entry && entry.value;
}

function isGreaterThan(value, threshold) {
  return parseInt(value) > parseInt(threshold);
}
