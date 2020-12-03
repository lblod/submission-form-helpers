/**
 * Checks if the given string is an valid integer format conform to xsd:integer.
 */
export default function constraintValidInteger(value) {
  if (value.datatype.value !== 'http://www.w3.org/2001/XMLSchema#integer') {
    return false;
  }
  const number = Number(value.value);
  return Number.isInteger(number) && Number.isSafeInteger(number);
}