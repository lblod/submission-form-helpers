import { RDF, FORM, SHACL } from "./namespaces.js";
import { triplesForPath } from "./triples-for/triples-for-path.js";

import required from "./constraints/required.js";
import codelist from "./constraints/codelist.js";
import singleCodelistValue from "./constraints/single-codelist-value.js";
import containsCodelistValue from "./constraints/contains-codelist-value.js";
import exactValue from "./constraints/exact-value.js";
import validUri from "./constraints/valid-uri.js";
import validDate from "./constraints/valid-date.js";
import validDateTime from "./constraints/valid-date-time.js";
import validInteger from "./constraints/valid-integer.js";
import positiveNumber from "./constraints/positive-number.js";
import conceptScheme from "./constraints/concept-scheme.js";
import validYear from "./constraints/valid-year.js";
import validEmail from "./constraints/valid-email.js";
import validIBAN from "./constraints/valid-iban.js";
import validPhoneNumber from "./constraints/valid-phone-number.js";
import validateExtraTaxRateOrAmount from "./constraints/vlabel-extra-taxrate-or-amount.js";
import validBoolean from "./constraints/valid-boolean.js";
import validChildcareSubsidyTable from "./constraints/valid-childcare-subsidy-table.js";
import singleInstanceTaxRateOrExtraTaxRate from "./constraints/vlabel-single-instance-tax-rate-or-extra-tax-rate.js";
import maxLength from "./constraints/max-length.js";
import validEngagementTable from "./constraints/valid-engagement-table.js";
import hasOneNumberGreaterThanInFields from "./constraints/has-one-number-greater-than-in-fields.js";
import matchValues from "./constraints/match-values.js";
import dateInPast from "./constraints/date-in-past.js";

const BUILT_IN_VALIDATIONS = new Map();
const CUSTOM_VALIDATIONS = new Map();

function registerDefaultValidations() {
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/RequiredConstraint",
    required
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/SingleCodelistValue",
    singleCodelistValue
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ContainsCodelistValue",
    containsCodelistValue
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/Codelist",
    codelist
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ExactValueConstraint",
    exactValue
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/UriConstraint",
    validUri
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidDate",
    validDate
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidDateTime",
    validDateTime
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidInteger",
    validInteger
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/PositiveNumber",
    positiveNumber
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ConceptSchemeConstraint",
    conceptScheme
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidYear",
    validYear
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidEmail",
    validEmail
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidIBAN",
    validIBAN
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidPhoneNumber",
    validPhoneNumber
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/VlabelExtraTaxRateOrAmountConstraint",
    validateExtraTaxRateOrAmount
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidBoolean",
    validBoolean
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidChildcareSubsidyTable",
    validChildcareSubsidyTable
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/VlabelSingleInstanceTaxRateOrExtraTaxRate",
    singleInstanceTaxRateOrExtraTaxRate
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/MaxLength",
    maxLength
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/ValidEngagementTable",
    validEngagementTable
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/HasOneNumberGreaterThanInFields",
    hasOneNumberGreaterThanInFields
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/MatchValues",
    matchValues
  );
  BUILT_IN_VALIDATIONS.set(
    "http://lblod.data.gift/vocabularies/forms/DateInPast",
    dateInPast
  );
}

registerDefaultValidations();

export function registerCustomValidation(uri, validator) {
  CUSTOM_VALIDATIONS.set(uri, validator);
}

export function resetCustomValidations() {
  CUSTOM_VALIDATIONS.clear();
}

export default function constraintForUri(uri) {
  const buildInValidator = BUILT_IN_VALIDATIONS.get(uri);
  if (buildInValidator) {
    return buildInValidator;
  }
  const customValidator = CUSTOM_VALIDATIONS.get(uri);
  if (customValidator) {
    return customValidator;
  }

  console.error(`No validation found for uri: ${uri}`);
  return false;
}

export async function check(constraintUri, options) {
  const { formGraph, sourceNode, sourceGraph, store } = options;
  let path = store.any(constraintUri, SHACL("path"), undefined, formGraph);
  let triplesData = triplesForPath({
    store: store,
    path,
    formGraph: formGraph,
    sourceNode: sourceNode,
    sourceGraph: sourceGraph,
  });
  return checkTriples(constraintUri, triplesData, options);
}

export async function checkTriples(constraintUri, triplesData, options) {
  const { formGraph, metaGraph, store, sourceNode, sourceGraph } = options;

  let values = triplesData.values;
  const validationType = store.any(
    constraintUri,
    RDF("type"),
    undefined,
    formGraph
  );
  // We assume this is always available?
  const groupingType = store.any(
    constraintUri,
    FORM("grouping"),
    undefined,
    formGraph
  ).value;
  const resultMessage = (
    store.any(constraintUri, SHACL("resultMessage"), undefined, formGraph) || ""
  ).value;

  let validator = constraintForUri(validationType && validationType.value);
  if (!validator) return { hasValidation: false, valid: true, resultMessage };

  const validationOptions = {
    store,
    metaGraph,
    constraintUri,
    sourceNode,
    sourceGraph,
    formGraph,
  };

  let validationResult;

  /*
   * - Bag: validator is expected to be able to do some custom validation a collection off values
   * - MatchSome: validator can only process one value BUT only some (1 or more) off those values that get passed to the validator have to adhere
   * - MatchEvery: validator can only process one value BUT all values that get passed to the validator have to adhere
   */
  if (groupingType == FORM("Bag").value) {
    validationResult = await Promise.resolve(
      validator(values, validationOptions)
    );
  } else if (groupingType == FORM("MatchSome").value) {
    validationResult = await asyncSome(
      async (value) => validator(value, validationOptions),
      values
    );
  } else if (groupingType == FORM("MatchEvery").value) {
    validationResult = await asyncEvery(
      async (value) => validator(value, validationOptions),
      values
    );
  }

  // console.log(`Validation ${validationType} [${groupingType}] with values ${values.join(',')} is ${validationResult}`);
  return {
    validationType: validationType.value,
    hasValidation: true,
    valid: validationResult,
    resultMessage,
  };
}

async function asyncSome(callBack, values) {
  if (!values || values.length === 0) {
    return true;
  }

  for (const value of values) {
    if (await Promise.resolve(callBack(value))) {
      return true;
    }
  }
  return false;
}

export async function asyncEvery(callBack, values) {
  if (!values || values.length === 0) {
    return true;
  }

  const results = await Promise.all(
    values.map((value) => Promise.resolve(callBack(value)))
  );

  return results.every((result) => result);
}
