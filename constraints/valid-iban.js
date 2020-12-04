import IBAN from 'iban';

/**
 * Checks if the given string is an valid IBAN.
 */
export default function constraintValidIBAN(value) {
  const iban = value.value;
  if (typeof iban != 'string') return false;
  return IBAN.isValid(iban);
}