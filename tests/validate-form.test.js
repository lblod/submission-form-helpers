import test from "ava";
import { NamedNode } from "rdflib";
import ForkingStore from "forking-store";
import { readFixtureFile } from "./test-helpers.js";
import { RDF, FORM, validateForm } from "../src/index.js";

const FORM_GRAPHS = {
  formGraph: new NamedNode("http://data.lblod.info/form"),
  metaGraph: new NamedNode("http://data.lblod.info/metagraph"),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  "http://ember-submission-form-fields/source-node"
);

test("it validates all the form fields including the ones in sub forms", (t) => {
  const formTtl = readFixtureFile("validate-form/form.ttl");

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");

  const form = store.any(
    undefined,
    RDF("type"),
    FORM("Form"),
    FORM_GRAPHS.formGraph
  );

  let isValid = validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });

  t.true(
    isValid,
    "The source data doesn't contain listing items, so the sub form fields aren't validated yet"
  );

  let sourceTtl = readFixtureFile(
    "validate-form/source-without-listing-field-data.ttl"
  );
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");
  isValid = validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });
  t.false(
    isValid,
    "The source data contains listing item root nodes, but no data for the fields so the validations fail"
  );

  sourceTtl = readFixtureFile(
    "validate-form/source-with-valid-listing-field-data.ttl"
  );
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");
  isValid = validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });
  t.true(isValid, "The source data contains valid listing item data");
});
