"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidChildcareSubsidyTable;

var _namespaces = require("../namespaces");

var _rdflibShim = _interopRequireDefault(require("./../rdflib-shim.js"));

var _positiveNumber = _interopRequireDefault(require("./positive-number"));

var _validInteger = _interopRequireDefault(require("./valid-integer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  namedNode
} = _rdflibShim.default;
const childcareSubsidyEntryPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/applicationFormEntry');
const actorNamePredicate = namedNode('http://mu.semte.ch/vocabularies/ext/actorName');
const numberChildrenForFullDayPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/numberChildrenForFullDay');
const numberChildrenForHalfDayPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/numberChildrenForHalfDay');
const numberChildrenPerInfrastructurePredicate = namedNode('http://mu.semte.ch/vocabularies/ext/numberChildrenPerInfrastructure');
/*
 * This custom validator has been build to validate a complex component that handles 4 fields which
 * require validation. From the way the form is built now, this is the easier way to validate it.
*/

function constraintValidChildcareSubsidyTable(table, options) {
  const {
    store,
    sourceGraph,
    constraintUri
  } = options;
  const childcareSubsidyEntries = store.match(table, childcareSubsidyEntryPredicate, undefined, sourceGraph);
  if (childcareSubsidyEntries.length == 0) return false;
  let isValidTable = true;
  childcareSubsidyEntries.map(e => e.object).forEach(entry => {
    // Each entry should have those 4 fields
    const hasRequiredTriples = hasTriples(entry, [actorNamePredicate, numberChildrenForFullDayPredicate, numberChildrenForHalfDayPredicate, numberChildrenPerInfrastructurePredicate], store, sourceGraph);

    if (!hasRequiredTriples) {
      isValidTable = false;
    } else {
      // Each entry should have a valid string as "naam actor"
      const validStrings = hasNotEmptyStrings(entry, [actorNamePredicate], store, sourceGraph);
      if (!validStrings) isValidTable = false; // Each entry should have a valid and positive ints as numbers

      const validPositiveInts = hasPositiveInts(entry, [numberChildrenForFullDayPredicate, numberChildrenForHalfDayPredicate, numberChildrenPerInfrastructurePredicate], store, sourceGraph);
      if (!validPositiveInts) isValidTable = false;
    }
  });
  return isValidTable;
}

function hasTriples(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach(predicate => {
    const value = store.match(entry, predicate, undefined, sourceGraph); // we expect only one per predicate

    result = result && value.length > 0;
  });
  return result;
}

function hasNotEmptyStrings(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach(predicate => {
    const string = store.match(entry, predicate, undefined, sourceGraph)[0].object.value.trim(); // we expect only one per predicate

    result = result && string != '';
  });
  return result;
}

function hasPositiveInts(entry, predicates, store, sourceGraph) {
  let result = true;
  predicates.forEach(predicate => {
    const value = store.match(entry, predicate, undefined, sourceGraph)[0].object; // we expect only one per predicate

    result = result && (0, _validInteger.default)(value) && (0, _positiveNumber.default)(value);
  });
  return result;
}