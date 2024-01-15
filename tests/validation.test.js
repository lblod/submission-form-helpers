import test from "ava";
import { NamedNode } from "rdflib";
import ForkingStore from "forking-store";
import { readFixtureFile } from "./test-helpers.js";
import {
  validationTypesForField,
  validationsForFieldWithType,
} from "../src/index.js";

const FORM_GRAPHS = {
  formGraph: new NamedNode("http://data.lblod.info/form"),
  metaGraph: new NamedNode("http://data.lblod.info/metagraph"),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

test("it returns the validation types for a field that doesn't have any", (t) => {
  const formTtl = readFixtureFile("conditionals-v2-target/form.ttl");
  const metaTtl = readFixtureFile("conditionals-v2-target/meta.ttl");

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");
  store.parse(metaTtl, FORM_GRAPHS.metaGraph, "text/turtle");

  let sourceTtl = readFixtureFile("conditionals-v2-target/source.ttl");
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");

  const fieldWithoutValidations = new NamedNode(
    "http://data.lblod.info/fields/43dd5003-c9a4-48c6-b650-b90f2bce8c7d"
  );

  const validations = validationsForFieldWithType(fieldWithoutValidations, {
    store,
    formGraph: FORM_GRAPHS.formGraph,
  });
  const types = validationTypesForField(fieldWithoutValidations, {
    store,
    formGraph: FORM_GRAPHS.formGraph,
  });

  t.snapshot(validations);
  t.snapshot(types);
});

test("it returns the validation types for a field that has multiple", (t) => {
  const formTtl = readFixtureFile("conditionals-v2-target/form.ttl");
  const metaTtl = readFixtureFile("conditionals-v2-target/meta.ttl");

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");
  store.parse(metaTtl, FORM_GRAPHS.metaGraph, "text/turtle");

  let sourceTtl = readFixtureFile("conditionals-v2-target/source.ttl");
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");

  const fieldWithValidations = new NamedNode(
    "http://data.lblod.info/fields/fd40cdcf-d085-4b71-930f-0b1c05e021d9"
  );

  const validations = validationsForFieldWithType(fieldWithValidations, {
    store,
    formGraph: FORM_GRAPHS.formGraph,
  });
  const types = validationTypesForField(fieldWithValidations, {
    store,
    formGraph: FORM_GRAPHS.formGraph,
  });

  t.snapshot(validations);
  t.snapshot(types);
});
