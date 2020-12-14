import validator from 'validator';
/**
 * Checks if it is a valid uri
 */
export default function constraintValidUri(value/*, options*/) {
  return validator.isURL(value.value);
}
