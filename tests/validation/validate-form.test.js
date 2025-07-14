import test from "ava";
import { NamedNode, Namespace } from "rdflib";
import ForkingStore from "forking-store";
import { readFixtureFile } from "../test-helpers.js";
import {
  RDF,
  FORM,
  validateForm,
  SHACL,
  registerCustomValidation,
} from "../../src/index.js";

const FORM_GRAPHS = {
  formGraph: new NamedNode("http://data.lblod.info/form"),
  metaGraph: new NamedNode("http://data.lblod.info/metagraph"),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  "http://ember-submission-form-fields/source-node"
);

async function registerCustomAsyncAndSyncValidation() {
  const EXT = new Namespace("http://mu.semte.ch/vocabularies/ext/");
  const customValidation = (value, options) => {
    const { constraintUri, store } = options;
    const expected = store.any(constraintUri, EXT("exactValue"), undefined);
    if (expected === undefined) {
      return false;
    }
    return !isNaN(parseInt(value.value, 10)) && value.value == expected.value;
  };

  const wait = async () => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };
  const asyncCustomValidation = async (value, options) => {
    await wait();

    return customValidation(value, options);
  };

  registerCustomValidation(
    "http://mu.semte.ch/vocabularies/ext/ExactNumberConstraint",
    customValidation
  );
  registerCustomValidation(
    "http://mu.semte.ch/vocabularies/ext/AsyncExactNumberConstraint",
    asyncCustomValidation
  );
}

test("it validates all the form fields including the ones in sub forms", async (t) => {
  const formTtl = readFixtureFile("validate-form/form.ttl");
  await registerCustomAsyncAndSyncValidation();

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");

  const form = store.any(
    undefined,
    RDF("type"),
    FORM("Form"),
    FORM_GRAPHS.formGraph
  );

  let isValid = await validateForm(form, {
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
  isValid = await validateForm(form, {
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
    "validate-form/source-with-valid-custom-field.ttl"
  );
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");
  isValid = await validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });
  t.true(isValid, "The source data contains valid listing item data");
});

test("it supports validating specific severity levels", async (t) => {
  const formTtl = readFixtureFile("validation/severity/form.ttl");

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");

  const form = store.any(
    undefined,
    RDF("type"),
    FORM("Form"),
    FORM_GRAPHS.formGraph
  );

  let isValid = await validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });

  t.false(isValid);

  const data = `
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/> .
    ${SOURCE_NODE} ext:inputValue "Something longer than the maxLength value" .
  `;

  store.parse(data, FORM_GRAPHS.sourceGraph, "text/turtle");

  isValid = await validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });

  t.true(
    isValid,
    "The form is valid because the warning severity is ignored by default"
  );

  isValid = await validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
    severity: SHACL("Warning"),
  });

  t.false(
    isValid,
    "The warning severity validations don't pass the validation check"
  );
});

test("it supports custom validation rules as soon as they are registered", async (t) => {
  const formTtl = readFixtureFile("validate-form/form.ttl");
  await registerCustomAsyncAndSyncValidation();

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");

  const form = store.any(
    undefined,
    RDF("type"),
    FORM("Form"),
    FORM_GRAPHS.formGraph
  );

  let sourceTtl = readFixtureFile(
    "validate-form/source-with-missing-listing-field-data.ttl"
  );
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");
  let isValid = await validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });
  t.false(
    isValid,
    "The source data contains valid input for all fields but no value for the custom validation, so it fails"
  );

  sourceTtl = readFixtureFile(
    "validate-form/source-with-invalid-custom-field.ttl"
  );
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");
  isValid = await validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });
  t.false(
    isValid,
    "The source data now contains a value, but it's not the correct one, so we still fail"
  );

  sourceTtl = readFixtureFile(
    "validate-form/source-with-valid-custom-field.ttl"
  );
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");
  isValid = await validateForm(form, {
    store,
    form,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });
  t.true(
    isValid,
    "The source data contains the right value for the custom validation field."
  );
});
