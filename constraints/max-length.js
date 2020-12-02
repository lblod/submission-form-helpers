import { FORM } from '../namespaces';

/**
 * Checks if the given value is not to longer then the given max length.
 */
export default function constraintMaxLength(value, options) {
  const { constraintUri, store } = options;
  const max = Number(store.any( constraintUri, FORM("max"), undefined).value) || 100000;

  switch (value.datatype.value){
    case 'http://www.w3.org/2001/XMLSchema#integer':
      return Number(value.value) <= max;
    case 'http://www.w3.org/2001/XMLSchema#decimal':
      return Number(value.value) <= max;
    case 'http://www.w3.org/2001/XMLSchema#string':
      return value.value.length <= max;
    default:
      console.log('Case not supported');
  }
}
