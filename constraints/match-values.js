import { FORM, SKOS } from '../namespaces';

/**
 * For an arbitrary list of elements, check whether the provided value matches one element of the list
 */

export default function constraintMatchValues(values, options) {
  const {constraintUri, store, metaGraph} = options;
  const targetValues = store
        .match(constraintUri, FORM('valueElement'), undefined)
        .map(triple => triple.object.value);
  return values.some(value => targetValues.includes(value.value));
}
