import { namedNode } from "rdflib";
import constraintPositiveNumber from "./positive-number.js";
import constraintValidInteger from "./valid-integer.js";

const childcareSubsidyEntryPredicate = namedNode(
  "http://mu.semte.ch/vocabularies/ext/applicationFormEntry"
);
const actorNamePredicate = namedNode(
  "http://mu.semte.ch/vocabularies/ext/actorName"
);
const numberChildrenForFullDayPredicate = namedNode(
  "http://mu.semte.ch/vocabularies/ext/numberChildrenForFullDay"
);
const numberChildrenForHalfDayPredicate = namedNode(
  "http://mu.semte.ch/vocabularies/ext/numberChildrenForHalfDay"
);
const numberChildrenPerInfrastructurePredicate = namedNode(
  "http://mu.semte.ch/vocabularies/ext/numberChildrenPerInfrastructure"
);

/*
 * This custom validator has been build to validate a complex component that handles 4 fields which
 * require validation. From the way the form is built now, this is the easier way to validate it.
 */

export default function constraintValidChildcareSubsidyTable(table, options) {
  const { store, sourceGraph } = options;
  const childcareSubsidyEntries = store.match(
    table,
    childcareSubsidyEntryPredicate,
    undefined,
    sourceGraph
  );

  if (childcareSubsidyEntries.length == 0) return false;

  let isValidTable = true;
  childcareSubsidyEntries
    .map((e) => e.object)
    .forEach((entry) => {
      // Each entry should have those 4 fields
      const hasRequiredTriples = hasTriples(
        entry,
        [
          actorNamePredicate,
          numberChildrenForFullDayPredicate,
          numberChildrenForHalfDayPredicate,
          numberChildrenPerInfrastructurePredicate,
        ],
        store,
        sourceGraph
      );
      if (!hasRequiredTriples) {
        isValidTable = false;
      } else {
        // Each entry should have a valid string as "naam actor"
        const validStrings = hasNotEmptyStrings(
          entry,
          [actorNamePredicate],
          store,
          sourceGraph
        );
        if (!validStrings) isValidTable = false;

        // Each entry should have a valid and positive ints as numbers
        const validPositiveInts = hasPositiveInts(
          entry,
          [
            numberChildrenForFullDayPredicate,
            numberChildrenForHalfDayPredicate,
            numberChildrenPerInfrastructurePredicate,
          ],
          store,
          sourceGraph
        );
        if (!validPositiveInts) isValidTable = false;
      }
    });

  return isValidTable;
}

function hasTriples(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach((predicate) => {
    const value = store.match(entry, predicate, undefined, sourceGraph); // we expect only one per predicate
    result = result && value.length > 0;
  });
  return result;
}

function hasNotEmptyStrings(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach((predicate) => {
    const string = store
      .match(entry, predicate, undefined, sourceGraph)[0]
      .object.value.trim(); // we expect only one per predicate
    result = result && string != "";
  });
  return result;
}

function hasPositiveInts(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach((predicate) => {
    const value = store.match(entry, predicate, undefined, sourceGraph)[0]
      .object; // we expect only one per predicate
    result =
      result &&
      constraintValidInteger(value) &&
      constraintPositiveNumber(value);
  });
  return result;
}
