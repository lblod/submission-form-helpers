import { RDF, FORM, SHACL } from './namespaces.js';
import {
  triplesForPath,
} from './import-triples-for-form.js';

import required from './constraints/required.js';
import codelist from './constraints/codelist.js';
import singleCodelistValue from './constraints/single-codelist-value.js';
import containsCodelistValue from './constraints/contains-codelist-value.js';
import exactValue from './constraints/exact-value.js';
import validUri from './constraints/valid-uri.js';
import validDate from './constraints/valid-date.js';
import validDateTime from './constraints/valid-date-time.js';
import validInteger from './constraints/valid-integer.js';
import positiveNumber from './constraints/positive-number.js';
import conceptScheme from './constraints/concept-scheme.js';
import validYear from './constraints/valid-year.js';
import validEmail from './constraints/valid-email.js';
import validIBAN from './constraints/valid-iban.js';
import validPhoneNumber from './constraints/valid-phone-number.js';
import validateExtraTaxRateOrAmount from './constraints/vlabel-extra-taxrate-or-amount.js';
import validBoolean from './constraints/valid-boolean.js';
import validChildcareSubsidyTable from './constraints/valid-childcare-subsidy-table.js';
import singleInstanceTaxRateOrExtraTaxRate from './constraints/vlabel-single-instance-tax-rate-or-extra-tax-rate.js';
import maxLength from './constraints/max-length.js';
import validEngagementTable from './constraints/valid-engagement-table.js';
import hasOneNumberGreaterThanInFields from './constraints/has-one-number-greater-than-in-fields.js';
import matchValues from './constraints/match-values.js';

export default function constraintForUri(uri) {
  switch (String(uri)) {
    case "http://lblod.data.gift/vocabularies/forms/RequiredConstraint":
      return required;
    case "http://lblod.data.gift/vocabularies/forms/SingleCodelistValue":
      return singleCodelistValue;
    case "http://lblod.data.gift/vocabularies/forms/ContainsCodelistValue":
      return containsCodelistValue;
    case "http://lblod.data.gift/vocabularies/forms/Codelist":
      return codelist;
    case "http://lblod.data.gift/vocabularies/forms/ExactValueConstraint":
      return exactValue;
    case "http://lblod.data.gift/vocabularies/forms/UriConstraint":
      return validUri;
    case "http://lblod.data.gift/vocabularies/forms/ValidDate":
      return validDate;
    case "http://lblod.data.gift/vocabularies/forms/ValidDateTime":
      return validDateTime;
    case "http://lblod.data.gift/vocabularies/forms/ValidInteger":
      return validInteger;
    case "http://lblod.data.gift/vocabularies/forms/PositiveNumber":
      return positiveNumber;
    case "http://lblod.data.gift/vocabularies/forms/ConceptSchemeConstraint":
      return conceptScheme;
    case "http://lblod.data.gift/vocabularies/forms/ValidYear":
      return validYear;
    case "http://lblod.data.gift/vocabularies/forms/ValidEmail":
      return validEmail;
    case "http://lblod.data.gift/vocabularies/forms/ValidIBAN":
      return validIBAN;
    case "http://lblod.data.gift/vocabularies/forms/ValidPhoneNumber":
      return validPhoneNumber;
    case "http://lblod.data.gift/vocabularies/forms/VlabelExtraTaxRateOrAmountConstraint":
      return validateExtraTaxRateOrAmount;
    case "http://lblod.data.gift/vocabularies/forms/ValidBoolean":
      return validBoolean;
    case "http://lblod.data.gift/vocabularies/forms/ValidChildcareSubsidyTable":
      return validChildcareSubsidyTable;
    case "http://lblod.data.gift/vocabularies/forms/VlabelSingleInstanceTaxRateOrExtraTaxRate":
      return singleInstanceTaxRateOrExtraTaxRate;
    case "http://lblod.data.gift/vocabularies/forms/MaxLength":
      return maxLength;
    case "http://lblod.data.gift/vocabularies/forms/ValidEngagementTable":
      return validEngagementTable;
    case "http://lblod.data.gift/vocabularies/forms/HasOneNumberGreaterThanInFields":
      return hasOneNumberGreaterThanInFields;
    case "http://lblod.data.gift/vocabularies/forms/MatchValues":
      return matchValues;
    default:
      return false; //TODO: TBD
  }
}

export function check(constraintUri, options){
  const { formGraph, sourceNode, sourceGraph, store } = options;
  let path = store.any( constraintUri, SHACL("path"), undefined, formGraph);
  let triplesData  = triplesForPath({
    store: store, path, formGraph: formGraph, sourceNode: sourceNode, sourceGraph: sourceGraph
  });
  return checkTriples(constraintUri, triplesData, options);
}

export function checkTriples(constraintUri, triplesData, options){
  const { formGraph, metaGraph, store, sourceNode, sourceGraph } = options;
  let values = triplesData.values;
  const validationType = store.any(constraintUri, RDF('type'), undefined, formGraph);
  const groupingType = store.any(constraintUri, FORM("grouping"), undefined, formGraph).value;
  const resultMessage = (store.any(constraintUri, SHACL("resultMessage"), undefined, formGraph) || "").value;

  let validator = constraintForUri(validationType && validationType.value);
  if( !validator ) return { hasValidation: false, valid: true, resultMessage };

  const validationOptions = { store, metaGraph, constraintUri, sourceNode, sourceGraph, formGraph };

  let validationResult;

/*
 * - Bag: validator is expected to be able to do some custom validation a collection off values
 * - MatchSome: validator can only process one value BUT only some (1 or more) off those values that get passed to the validator have to adhere
 * - MatchEvery: validator can only process one value BUT all values that get passed to the validator have to adhere
*/
  if( groupingType == FORM("Bag").value ) {
    validationResult = validator( values, validationOptions );
  } else if( groupingType == FORM("MatchSome").value ) {
    validationResult = values.some( (value) => validator( value, validationOptions ) );
  } else if( groupingType == FORM("MatchEvery").value ) {
    validationResult = values.every( (value) => validator( value, validationOptions ) );
  }

  // console.log(`Validation ${validationType} [${groupingType}] with values ${values.join(',')} is ${validationResult}`);
  return { validationType: validationType.value, hasValidation: true, valid: validationResult, resultMessage };

}
