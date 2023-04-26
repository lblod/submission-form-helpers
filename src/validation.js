import { FORM, RDF } from "./namespaces.js";
import { fieldsForForm } from "./fields-for-form.js";
import { check, checkTriples } from "./constraints.js";

export function validateForm(form, options) {
  const fields = fieldsForForm(form, options);
  const fieldValidations = fields.map((field) => validateField(field, options));
  return fieldValidations.reduce((acc, value) => acc && value, true);
}

export function validateField(fieldUri, options) {
  return validationResultsForField(fieldUri, options).reduce(
    (acc, value) => acc && value.valid,
    true
  );
}

export function validationResultsForField(fieldUri, options) {
  const { store, formGraph } = options;
  const validationConstraints = store
    .match(fieldUri, FORM("validations"), undefined, formGraph)
    .map((t) => t.object);

  const validationResults = [];
  for (const constraintUri of validationConstraints) {
    const validationResult = check(constraintUri, options);
    validationResults.push(validationResult);
  }
  return validationResults;
}

export function validationTypesForField(fieldUri, options) {
  const { store, formGraph } = options;
  const validationConstraints = store
    .match(fieldUri, FORM("validations"), undefined, formGraph)
    .map((t) => t.object);

  const validationTypes = validationConstraints
    .map(
      (constraintS) =>
        store.match(constraintS, RDF("type"), undefined, formGraph)[0]
    ) //There must be a least once
    .map((triple) => triple.object);
  return validationTypes;
}

export function validationResultsForFieldPart(triplesData, fieldUri, options) {
  const { store, formGraph } = options;
  const validationConstraints = store
    .match(fieldUri, FORM("validations"), undefined, formGraph)
    .map((t) => t.object);

  const validationResults = [];
  for (const constraintUri of validationConstraints) {
    const validationResult = checkTriples(constraintUri, triplesData, options);
    validationResults.push(validationResult);
  }
  return validationResults;
}
