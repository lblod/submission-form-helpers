import test from "ava";
import { NamedNode, Namespace } from "rdflib";
import ForkingStore from "forking-store";
import { readFixtureFile } from "../test-helpers.js";
import {
  RDF,
  FORM,
  registerCustomValidation,
  validationResultsForField,
} from "../../src/index.js";
import { EXT } from "../namespaces.js";
import constraintsRequired from "../../src/constraints/required.js";

const FORM_GRAPHS = {
  formGraph: new NamedNode("http://data.lblod.info/form"),
  metaGraph: new NamedNode("http://data.lblod.info/metagraph"),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  "http://ember-submission-form-fields/source-node"
);

async function registerCustomValidatorReturningBoolean() {
  const customValidation = (values, options) => {
    return constraintsRequired(values, options)
  }
  const EXT = new Namespace("http://mu.semte.ch/vocabularies/ext/");
  registerCustomValidation(EXT('RequiredConstraintWithCustomValidatorReturningBoolean').value, customValidation);
}

async function registerCustomValidatorReturningBooleanAndResultMessage() {
  const customValidation = (values, options) => {
    return {
      valid: constraintsRequired(values, options),
      resultMessage: 'This field is required. This is a custom result message returned by the validation function.'
    }
  }
  registerCustomValidation(EXT('RequiredConstraintWithCustomValidatorReturningBooleanAndCustomResultMessage').value, customValidation);
}

let STORE;

test.beforeEach(async (t) => {
  const fieldTtl = readFixtureFile("validate-field/field.ttl");
  await registerCustomValidatorReturningBoolean();
  await registerCustomValidatorReturningBooleanAndResultMessage();
  STORE = new ForkingStore();
  STORE.parse(fieldTtl, FORM_GRAPHS.formGraph, 'text/turtle');
})

test("validation fails when field is not filled in", async (t) => {

  const sourceTtl = readFixtureFile(
    "validate-field/source-without-field-data.ttl"
  );
  STORE.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");

  const field = STORE.any(
    undefined,
    RDF("type"),
    FORM("Field"),
    FORM_GRAPHS.formGraph
  );



  const validationResults = await validationResultsForField(field, {
    store: STORE, ...FORM_GRAPHS, sourceNode: SOURCE_NODE,
  })
  t.deepEqual(validationResults, [
    {
      hasValidation: true,
      valid: false,
      resultMessage: 'This field is required. (Built-in validator)',
      validationType: FORM('RequiredConstraint').value,
    },
    {
      hasValidation: true,
      valid: false,
      resultMessage: 'This field is required. (Custom validator returning boolean)',
      validationType: EXT('RequiredConstraintWithCustomValidatorReturningBoolean').value,
    },
    {
      hasValidation: true,
      valid: false,
      resultMessage: 'This field is required. This is a custom result message returned by the validation function.',
      validationType: EXT('RequiredConstraintWithCustomValidatorReturningBooleanAndCustomResultMessage').value,
    }
  ]);


})
test("validation succeeds when field is filled in", async (t) => {
  const sourceTtl = readFixtureFile(
    "validate-field/source-with-field-data.ttl"
  );
  STORE.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");
  const field = STORE.any(
    undefined,
    RDF("type"),
    FORM("Field"),
    FORM_GRAPHS.formGraph
  );

  const validationResults = await validationResultsForField(field, {
    store: STORE, ...FORM_GRAPHS, sourceNode: SOURCE_NODE,
  })
  t.deepEqual(validationResults, [
    {
      hasValidation: true,
      valid: true,
      resultMessage: 'This field is required. (Built-in validator)',
      validationType: FORM('RequiredConstraint').value,
    },
    {
      hasValidation: true,
      valid: true,
      resultMessage: 'This field is required. (Custom validator returning boolean)',
      validationType: EXT('RequiredConstraintWithCustomValidatorReturningBoolean').value,
    },
    {
      hasValidation: true,
      valid: true,
      resultMessage: 'This field is required. This is a custom result message returned by the validation function.',
      validationType: EXT('RequiredConstraintWithCustomValidatorReturningBooleanAndCustomResultMessage').value,
    }
  ]);
})