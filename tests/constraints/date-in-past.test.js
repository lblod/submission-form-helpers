import test from "ava";
import { Literal } from "rdflib";
import dateInPast from "../../src/constraints/date-in-past.js";

test("it works for xsd:date literals", (t) => {
  const pastDate = dateLiteral("2024-01-18");
  t.true(dateInPast(pastDate));

  const now = new Date();
  const nextYear = now.getFullYear() + 1;
  const futureDate = dateLiteral(`${nextYear}-01-18`);
  t.false(dateInPast(futureDate));
});

test("it works for xsd:dateTime literals", (t) => {
  let testDate = dateTimeLiteral("2024-01-19T11:38:43Z");
  t.true(dateInPast(testDate));

  const now = new Date();
  const nextYear = now.getFullYear() + 1;

  testDate = dateTimeLiteral(`${nextYear}-01-19T11:38:43Z`);
  t.false(dateInPast(testDate));
});

test("it returns `false` if it's not a date literal", (t) => {
  t.false(dateInPast(Literal.fromNumber(1)));
  t.false(dateInPast(Literal.fromBoolean(false)));
  t.false(dateInPast(Literal.fromValue("foo")));
});

function dateLiteral(dateString) {
  return new Literal(dateString, null, "http://www.w3.org/2001/XMLSchema#date");
}

function dateTimeLiteral(dateTimeString) {
  return new Literal(
    dateTimeString,
    null,
    "http://www.w3.org/2001/XMLSchema#dateTime"
  );
}
