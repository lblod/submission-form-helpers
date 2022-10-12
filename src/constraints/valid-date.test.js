import test from "ava";
import { Literal } from "rdflib";
import validDate from "./valid-date.js";

test('it validates if the provided literal is a valid "xsd:date"', (t) => {
  let dateLiteral = new Literal(
    "2022-10-12",
    null,
    "http://www.w3.org/2001/XMLSchema#date"
  );
  t.true(validDate(dateLiteral));

  dateLiteral = new Literal(
    "2022-14-32",
    null,
    "http://www.w3.org/2001/XMLSchema#date"
  );
  t.false(validDate(dateLiteral), "unrealistic dates return false");

  dateLiteral = new Literal(
    "2022-10-12T12:01:52Z",
    null,
    "http://www.w3.org/2001/XMLSchema#dateTime"
  );
  t.false(
    validDate(dateLiteral),
    "xsd:dateTime literals aren't considered valid"
  );
});
