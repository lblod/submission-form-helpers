/**
 * Checks if the given string is a positive number.
 */
export default function constraintPositiveNumber(value) {
  const number =  Number(value.value);
  if (isNaN(number)) return false;
  return number >= 0;
}