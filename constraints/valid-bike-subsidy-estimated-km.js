import { FORM, SKOS } from '../namespaces';
import rdflib from "./../rdflib-shim.js";
import constraintPositiveNumber from './positive-number';
import constraintValidInteger from './valid-integer';

const { namedNode } = rdflib;

const improvementOneSidePredicate = namedNode('http://lblod.data.gift/vocabularies/subsidie/improvementOneSide');
const improvementBothSidesPredicate = namedNode('http://lblod.data.gift/vocabularies/subsidie/improvementBothSides');
const newOneSidePredicate = namedNode('http://lblod.data.gift/vocabularies/subsidie/newOneSide');
const newBothSidesPredicate = namedNode('http://lblod.data.gift/vocabularies/subsidie/newBothSides');

export default function constraintValidBikeSubsidyEstimatedKm(field, options) {
  const { store, sourceGraph, constraintUri } = options;

  const improvementOneSideValue = getValue(store, sourceGraph, improvementOneSidePredicate);
  const improvementBothSidesValue = getValue(store, sourceGraph, improvementBothSidesPredicate);
  const newOneSideValue = getValue(store, sourceGraph, newOneSidePredicate);
  const newBothSidesValue = getValue(store, sourceGraph, newBothSidesPredicate);

  if (
    (improvementOneSideValue && isValid(improvementOneSideValue)) ||
    (improvementBothSidesValue && isValid(improvementBothSidesValue)) ||
    (newOneSideValue && isValid(newOneSideValue)) ||
    (newBothSidesValue && isValid(newBothSidesValue))
  ) {
    return true;
  } else {
    return false;
  }
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

function isValid(object) {
  return constraintValidInteger(object) && constraintPositiveNumber(object) && (parseInt(object.value)>0);
}
// To fix : if one of the value isn't an int / negative int, false
