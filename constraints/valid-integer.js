/**
 * Checks if the given string is an valid integer format conform to xsd:integer.
 */
export default function constraintValidInteger(value) {
  if (value.datatype.value !== 'http://www.w3.org/2001/XMLSchema#integer') {
    return false;
  }
  return Number.isInteger(value.value) && Number.isSafeInteger(value.value);
}