import { Literal } from "rdflib";
import { XSD } from "../namespaces.js";

/**
 * @param {Literal} dateLiteral
 * @returns {boolean}
 */
export default function dateInPast(dateLiteral /*, options*/) {
  if (
    dateLiteral.datatype.equals(XSD("date")) ||
    dateLiteral.datatype.equals(XSD("dateTime"))
  ) {
    const date = Literal.toJS(dateLiteral);

    return date <= Date.now();
  }

  return false;
}
