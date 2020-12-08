import parsePhoneNumber from 'libphonenumber-js'
import { FORM } from '../namespaces';

/**
 * Checks if the given string is an valid phone number.
 */
export default function constraintValidPhoneNumber(value, options) {
  const { constraintUri, store } = options;
  const defaultCountry = store.any( constraintUri, FORM("defaultCountry"), undefined).value || 'BE';
  const phoneNumber = parsePhoneNumber(value.value, defaultCountry);

  if (phoneNumber)
    return phoneNumber.isPossible();

  return false;
}
