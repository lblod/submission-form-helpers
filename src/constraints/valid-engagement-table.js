import { FORM, SKOS } from '../namespaces';
import rdflib from "rdflib";
import constraintPositiveNumber from './positive-number';
import constraintValidInteger from './valid-integer';
import constraintMaxLength from './max-length';

const { namedNode } = rdflib;

const engagementEntryPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/engagementEntry');
const existingStaffPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/existingStaff');
const additionalStaffPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/additionalStaff');
const volunteersPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/volunteers');

/*
 * This custom validator has been build to validate a complex component that handles fields which
 * require validation. From the way the form is built now, this is the easier way to validate it.
*/

export default function constraintValidEngagementTable(table, options) {
  const { store, sourceGraph, constraintUri } = options;
  const engagementEntries = store.match(
    table,
    engagementEntryPredicate,
    undefined,
    sourceGraph
  );

  if (engagementEntries.length == 0)
    return false;

  let isValidTable = true;
  engagementEntries.map(e => e.object).forEach(entry => {
    // Each entry should have those 4 fields
    const hasRequiredTriples = hasTriples(
        entry,
        [ existingStaffPredicate,
          additionalStaffPredicate,
          volunteersPredicate ],
        store,
        sourceGraph
    );
    if (!hasRequiredTriples) {
      isValidTable = false;
    } else {
      // Each entry should have a valid and positive ints as numbers
      const validPositiveInts = hasPositiveNumbers(
        entry,
        [ existingStaffPredicate,
          additionalStaffPredicate,
          volunteersPredicate ],
        store,
        sourceGraph
      );
      if (!validPositiveInts)
        isValidTable = false;
    }
  });

  return isValidTable;
}

function hasTriples(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach(predicate => {
    const value = store.match(
      entry,
      predicate,
      undefined,
      sourceGraph
    ); // we expect only one per predicate
    result = result && (value.length > 0);
  });
  return result;
}

function hasNotEmptyStrings(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach(predicate => {
    const string = store.match(
      entry,
      predicate,
      undefined,
      sourceGraph
    )[0].object.value.trim(); // we expect only one per predicate
    result = result && (string != '');
  });
  return result;
}

function hasPositiveNumbers(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach(predicate => {
    const value = store.match(
      entry,
      predicate,
      undefined,
      sourceGraph
    )[0].object; // we expect only one per predicate
    result = result && constraintPositiveNumber(value);
  });
  return result;
}
