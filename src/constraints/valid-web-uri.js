import isURL from "validator/lib/isURL.js";

/**
 * Checks if it is a valid uri
 */
export default function constraintValidWebUri(value /*, options*/) {
  return isURL(value.value, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  });
}
