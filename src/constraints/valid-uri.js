import isURL from "validator/lib/isURL.js";

/**
 * Checks if it is a valid uri
 */
export default function constraintValidUri(value /*, options*/) {
  return isURL(value.value, {
    require_protocol: true,
    require_valid_protocol: true,
  });
}
