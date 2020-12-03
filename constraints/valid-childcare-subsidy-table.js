import { FORM, SKOS } from '../namespaces';
import rdflib from "./../rdflib-shim.js";
import constraintPositiveNumber from './positive-number';
import constraintValidInteger from './valid-integer';

const { namedNode } = rdflib;

const childcareSubsidyEntryPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/applicationFormEntry');
const actorNamePredicate = namedNode('http://mu.semte.ch/vocabularies/ext/actorName');
const numberChildrenForFullDayPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/numberChildrenForFullDay');
const numberChildrenForHalfDayPredicate = namedNode('http://mu.semte.ch/vocabularies/ext/numberChildrenForHalfDay');
const numberChildrenPerInfrastructurePredicate = namedNode('http://mu.semte.ch/vocabularies/ext/numberChildrenPerInfrastructure');

export default function constraintValidChildcareSubsidyTable(table, options) {
console.log('Bienvenue dans la validation')
  const { store, sourceGraph } = options;
  const childcareSubsidyEntries = store.match(
    table,
    childcareSubsidyEntryPredicate,
    undefined
  );
console.log('On va regarder si on a des entries')
  if (childcareSubsidyEntries.length == 0)
    return false;
console.log('yey on a des entries')
  childcareSubsidyEntries.map(e => e.object).forEach(entry => {
    // 1. Required values
    const hasRequiredFields = hasTriple(entry, actorNamePredicate, store, sourceGraph) &&
                              hasTriple(entry, numberChildrenForFullDayPredicate, store, sourceGraph) &&
                              hasTriple(entry, numberChildrenForHalfDayPredicate, store, sourceGraph) &&
                              hasTriple(entry, numberChildrenPerInfrastructurePredicate, store, sourceGraph);
    if (!hasRequiredFields)
      return false;
console.log('all fields are filled')
    // 2. Non empty string
    const actorNameNotEmptyString = store.match(
      entry,
      actorNamePredicate,
      undefined,
      sourceGraph
    )[0].object.value.trim();
    
    if (actorNameNotEmptyString == '')
      return false;
console.log('actor name is not empty')
    // 3. Positive int
    const hasPositiveInts = hasPositiveInt(entry, numberChildrenForFullDayPredicate, store, sourceGraph) &&
                            hasPositiveInt(entry, numberChildrenForHalfDayPredicate, store, sourceGraph) &&
                            hasPositiveInt(entry, numberChildrenPerInfrastructurePredicate, store, sourceGraph);
    if (!hasPositiveInts)
      return false;
console.log('we have posiive ints')
    return true;
  });

  // TODO
  // 1. Adapter pour check CHAQUE entry
  // 2. Aussi vérifier la longueur des fields
  // 3. Adapter le component pour refléter ça, histoire que le user sache ce qu'il en est
}

function hasTriple(entry, predicate, store, sourceGraph) {
  return store.match(
    entry,
    predicate,
    undefined,
    sourceGraph
  ).length > 0;
}

function hasPositiveInt(entry, predicate, store, sourceGraph) {
  const value = store.match(
    entry,
    predicate,
    undefined,
    sourceGraph
  )[0].object; // we expect only one per predicate
  return constraintValidInteger(value) && constraintPositiveNumber(value);
}
