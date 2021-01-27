"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintValidEngagementTable;

var _namespaces = require("../namespaces");

var _rdflibShim = _interopRequireDefault(require("./../rdflib-shim.js"));

var _positiveNumber = _interopRequireDefault(require("./positive-number"));

var _validInteger = _interopRequireDefault(require("./valid-integer"));

var _maxLength = _interopRequireDefault(require("./max-length"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  namedNode
} = _rdflibShim.default;
const engagementEntryPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/engagementEntry');
const existingStaffPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/existingStaff');
const additionalStaffPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/additionalStaff');
const volunteersPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/volunteers');
const estimatedCostPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/estimatedCost');
/*
 * This custom validator has been build to validate a complex component that handles fields which
 * require validation. From the way the form is built now, this is the easier way to validate it.
*/

function constraintValidEngagementTable(table, options) {
  const {
    store,
    sourceGraph,
    constraintUri
  } = options;
  const engagementEntries = store.match(table, engagementEntryPredicate, undefined, sourceGraph);
  if (engagementEntries.length == 0) return false;
  let isValidTable = true;
  engagementEntries.map(e => e.object).forEach(entry => {
    // Each entry should have those 4 fields
    const hasRequiredTriples = hasTriples(entry, [existingStaffPredicate, additionalStaffPredicate, volunteersPredicate, estimatedCostPredicate], store, sourceGraph);

    if (!hasRequiredTriples) {
      isValidTable = false;
    } else {
      // Each entry should have a valid and positive ints as numbers
      const validPositiveInts = hasPositiveInts(entry, [existingStaffPredicate, additionalStaffPredicate, volunteersPredicate, estimatedCostPredicate], store, sourceGraph);
      if (!validPositiveInts) isValidTable = false; // Estimated cost should have a maximum of 6 numbers

      const validSizedInts = hasValidSizedInts(entry, [estimatedCostPredicate], store, sourceGraph, options);
      if (!validSizedInts) isValidTable = false;
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

function hasValidSizedInts(entry, predicates, store, sourceGraph, options) {
  let result = true;
  predicates.forEach(predicate => {
    const value = store.match(entry, predicate, undefined, sourceGraph)[0].object; // we expect only one per predicate

    result = result && (0, _maxLength.default)(value, options);
  });
  return result;
}