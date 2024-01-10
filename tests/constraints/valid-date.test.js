import test from "ava";
import { Literal } from "rdflib";
import validDate from "../../src/constraints/valid-date.js";

test('it validates if the provided literal is a valid "xsd:date"', (t) => {
  t.true(validDate(dateLiteral("2022-10-12")));

  t.false(
    validDate(dateLiteral("2022-14-32")),
    "unrealistic dates return false"
  );

  t.false(
    validDate(dateLiteral("2022-10-12T12:01:52Z")),
    "xsd:dateTime literals aren't considered valid"
  );

  t.false(validDate(dateLiteral("")), "empty strings aren't considered valid");

  t.false(validDate(Literal.fromNumber(42)), "xsd:integer values return false");
  t.false(
    validDate(Literal.fromNumber(12.34)),
    "xsd:decimal values return false"
  );
  t.false(
    validDate(Literal.fromBoolean(true)),
    "xsd:boolean values return false"
  );
});

function dateLiteral(dateString) {
  return new Literal(dateString, null, "http://www.w3.org/2001/XMLSchema#date");
}
