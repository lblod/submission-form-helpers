import test from "ava";
import { Literal } from "rdflib";
import validDateTime from "../../src/constraints/valid-date-time.js";

test('it validates if the provided literal is a valid "xsd:dateTime"', (t) => {
  let dateTime = dateTimeLiteral("2022-10-14T10:40:43Z");
  t.true(validDateTime(dateTime));

  dateTime = dateTimeLiteral("2022-10-14T10:40:43+02:00");
  t.true(validDateTime(dateTime));

  dateTime = dateTimeLiteral("2022-10-40T10:40:43Z");
  t.false(validDateTime(dateTime), "unrealistic dates return false");

  dateTime = dateTimeLiteral("2022-20-10T10:40:43Z");
  t.false(validDateTime(dateTime), "unrealistic months return false");

  dateTime = dateTimeLiteral("2022-10-14T30:40:43Z");
  t.false(validDateTime(dateTime), "unrealistic hours return false");

  dateTime = dateTimeLiteral("2022-10-14T10:60:43Z");
  t.false(validDateTime(dateTime), "unrealistic minutes return false");

  dateTime = dateTimeLiteral("2022-10-14T10:40:60Z");
  t.false(validDateTime(dateTime), "unrealistic seconds return false");

  dateTime = new Literal(
    "2022-10-14",
    null,
    "http://www.w3.org/2001/XMLSchema#date"
  );
  t.false(validDateTime(dateTime), "xsd:date literals aren't considered valid");
});

function dateTimeLiteral(dateTimeString) {
  return new Literal(
    dateTimeString,
    null,
    "http://www.w3.org/2001/XMLSchema#dateTime"
  );
}
