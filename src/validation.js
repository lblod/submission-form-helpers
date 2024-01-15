import { NamedNode } from "rdflib";
import { FORM, RDF } from "./namespaces.js";
import { fieldsForForm, fieldsForSubForm } from "./fields-for-form.js";
import { check, checkTriples } from "./constraints.js";
import { getScope } from "./get-scope.js";
import { triplesForScope } from "./triples-for/triples-for-scope.js";

export function validateForm(form, options) {
  const topLevelFields = fieldsForForm(form, options);

  return validateFields(topLevelFields, options);
}

function validateFields(fields, options) {
  const fieldValidations = fields.map((field) => {
    if (isListing(field, options)) {
      const listing = field;
      const scope = getScope(listing, options);
      const { values: subFormSourceNodes } = triplesForScope(scope, options);
      const hasSubFormData = subFormSourceNodes.length > 0;

      if (hasSubFormData) {
        const { store } = options;
        const subForm = store.any(listing, FORM("each"), undefined);
        const subformFields = fieldsForSubForm(subForm, options);

        return subFormSourceNodes
          .map((sourceNode) => {
            return validateFields(subformFields, { ...options, sourceNode });
          })
          .every(Boolean);
      } else {
        // TODO: should we validate sh:minCount / sh:maxCount?
        return true;
      }
    } else {
      return validateField(field, options);
    }
  });
  return fieldValidations.every(Boolean);
}

function isListing(field, options) {
  let { store, formGraph } = options;
  return Boolean(
    store.any(
      field,
      RDF("type"),
      new NamedNode("http://lblod.data.gift/vocabularies/forms/Listing"),
      formGraph
    )
  );
}

export function validateField(fieldUri, options) {
  return validationResultsForField(fieldUri, options).reduce(
    (acc, value) => acc && value.valid,
    true
  );
}

function validationsForField(fieldUri, options) {
  const { store, formGraph } = options;
  const v2Result = store.match(
    fieldUri,
    FORM("validatedBy"),
    undefined,
    formGraph
  );
  if (v2Result.length > 0) {
    return v2Result;
  }
  return store.match(fieldUri, FORM("validations"), undefined, formGraph);
}

export function validationResultsForField(fieldUri, options) {
  const validationConstraints = validationsForField(fieldUri, options).map(
    (t) => t.object
  );

  const validationResults = [];
  for (const constraintUri of validationConstraints) {
    const validationResult = check(constraintUri, options);
    validationResults.push(validationResult);
  }
  return validationResults;
}

export function validationsForFieldWithType(fieldUri, options) {
  const { store, formGraph } = options;
  const validationConstraints = validationsForField(fieldUri, options).map(
    (t) => t.object
  );

  const validationsWithType = [];
  validationConstraints.forEach((constraintS) => {
    const type = store.match(constraintS, RDF("type"), undefined, formGraph)[0]
      .object;
    validationsWithType.push({constraintUri: constraintS, type});
  });
  return validationsWithType;
}

export function validationTypesForField(fieldUri, options) {
  const validationsWithType = validationsForFieldWithType(fieldUri, options);
  return Object.values(validationsWithType);
}

export function validationResultsForFieldPart(triplesData, fieldUri, options) {
  const validationConstraints = validationsForField(fieldUri, options).map(
    (t) => t.object
  );

  const validationResults = [];
  for (const constraintUri of validationConstraints) {
    const validationResult = checkTriples(constraintUri, triplesData, options);
    validationResults.push(validationResult);
  }
  return validationResults;
}
