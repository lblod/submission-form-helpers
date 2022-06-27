import { FORM } from '../namespaces';

/**
 * For an arbitrary list of elements, check whether the provided value matches one element of the list
 */

export default function constraintMatchValues(values, options) {
  const {constraintUri, store } = options;
  const targetValuesIn = store.match(constraintUri, FORM('valuesIn'), undefined);
  const targetValuesNotIn = store.match(constraintUri, FORM('valuesNotIn'), undefined);

  if(values.length == 0) {
    //We don't want to evaluate if there is nothing on this path
    return false;
  }

  else if(targetValuesIn.length) {
    const elements = targetValuesIn[0].object.elements.map(element => element.value);
    return values.filter(value => elements.includes(value.value)).length > 0;
  }

  else if(targetValuesNotIn.length) {
    const elements = targetValuesNotIn[0].object.elements.map(element => element.value);
    return values.filter(value => elements.includes(value.value)).length == 0;
  }

  else return false;
}
