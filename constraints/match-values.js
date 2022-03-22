import { FORM, SKOS } from '../namespaces';

/**
 * Checks if the supplied values contain the defined custom value.
 */

export default function constraintMatchValues(values, options) {
  const {constraintUri, store, metaGraph} = options;
  const targetValues = store
        .match(constraintUri, FORM('valueElement'), undefined)
        .map(triple => triple.object.value);
  return values.some(value => targetValues.includes(value.value));
}
