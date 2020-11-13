import { FORM, SKOS } from '../namespaces';

/**
 * Checks if the supplied values contain the defined custom value.
 */

export default function constraintsContainsCodelistValue(values, options) {
  const {constraintUri, store, metaGraph} = options;
  const concept = store.any(constraintUri, FORM('customValue'), undefined);
  const conceptSchemeUri = store.any( constraintUri, FORM("conceptScheme"), undefined );
  const matchingValues =
      values
      .filter( (value) => {
        const matchCount =
            store
            .match( value, SKOS("inScheme"), conceptSchemeUri, metaGraph )
                .length;
        return matchCount >= 1;
      });
  return matchingValues.map(value => value.value).includes(concept.value);
}
