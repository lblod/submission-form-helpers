import test from "ava";
import { NamedNode } from "rdflib";
import ForkingStore from "forking-store";
import { readFixtureFile } from "../test-helpers.js";
import { RDF, FORM, validationsForField } from "../../src/index.js";
import { EXT } from "../namespaces.js";

const FORM_GRAPHS = {
  formGraph: new NamedNode("http://data.lblod.info/form"),
  metaGraph: new NamedNode("http://data.lblod.info/metagraph"),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

test("it returns all the validations for a specific field, as defined in the form graph", (t) => {
  const formTtl = readFixtureFile("validation/validations-for-field/form.ttl");

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");

  const form = store.any(
    undefined,
    RDF("type"),
    FORM("Form"),
    FORM_GRAPHS.formGraph
  );

  let fieldUri = EXT('inputField');

  let validations = validationsForField(fieldUri, {
    store,
    form,
    ...FORM_GRAPHS,
  });

  t.true(validations.length === 1);
});
