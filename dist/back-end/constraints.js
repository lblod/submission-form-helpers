"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constraintForUri;
exports.check = check;
exports.checkTriples = checkTriples;
Object.defineProperty(exports, "RDF", {
  enumerable: true,
  get: function () {
    return _namespaces.RDF;
  }
});
Object.defineProperty(exports, "FORM", {
  enumerable: true,
  get: function () {
    return _namespaces.FORM;
  }
});
Object.defineProperty(exports, "SHACL", {
  enumerable: true,
  get: function () {
    return _namespaces.SHACL;
  }
});
Object.defineProperty(exports, "SKOS", {
  enumerable: true,
  get: function () {
    return _namespaces.SKOS;
  }
});
Object.defineProperty(exports, "XSD", {
  enumerable: true,
  get: function () {
    return _namespaces.XSD;
  }
});
Object.defineProperty(exports, "DCT", {
  enumerable: true,
  get: function () {
    return _namespaces.DCT;
  }
});
Object.defineProperty(exports, "NIE", {
  enumerable: true,
  get: function () {
    return _namespaces.NIE;
  }
});
Object.defineProperty(exports, "triplesForPath", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.triplesForPath;
  }
});
Object.defineProperty(exports, "triplesForScope", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.triplesForScope;
  }
});
Object.defineProperty(exports, "fieldsForForm", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.fieldsForForm;
  }
});
Object.defineProperty(exports, "validateForm", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.validateForm;
  }
});
Object.defineProperty(exports, "validateField", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.validateField;
  }
});
Object.defineProperty(exports, "validationTypesForField", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.validationTypesForField;
  }
});
Object.defineProperty(exports, "validationResultsForField", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.validationResultsForField;
  }
});
Object.defineProperty(exports, "validationResultsForFieldPart", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.validationResultsForFieldPart;
  }
});
Object.defineProperty(exports, "updateSimpleFormValue", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.updateSimpleFormValue;
  }
});
Object.defineProperty(exports, "addSimpleFormValue", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.addSimpleFormValue;
  }
});
Object.defineProperty(exports, "removeSimpleFormValue", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.removeSimpleFormValue;
  }
});
Object.defineProperty(exports, "removeDatasetForSimpleFormValue", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.removeDatasetForSimpleFormValue;
  }
});
Object.defineProperty(exports, "removeTriples", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.removeTriples;
  }
});
Object.defineProperty(exports, "importTriplesForForm", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.importTriplesForForm;
  }
});
Object.defineProperty(exports, "getFormModelVersion", {
  enumerable: true,
  get: function () {
    return _importTriplesForForm.getFormModelVersion;
  }
});
Object.defineProperty(exports, "generatorsForNode", {
  enumerable: true,
  get: function () {
    return _generators.generatorsForNode;
  }
});
Object.defineProperty(exports, "triplesForGenerator", {
  enumerable: true,
  get: function () {
    return _generators.triplesForGenerator;
  }
});

var _namespaces = require("./namespaces");

var _importTriplesForForm = require("./import-triples-for-form");

var _generators = require("./generators");

var _required = _interopRequireDefault(require("./constraints/required"));

var _codelist = _interopRequireDefault(require("./constraints/codelist"));

var _singleCodelistValue = _interopRequireDefault(require("./constraints/single-codelist-value"));

var _containsCodelistValue = _interopRequireDefault(require("./constraints/contains-codelist-value"));

var _exactValue = _interopRequireDefault(require("./constraints/exact-value"));

var _validUri = _interopRequireDefault(require("./constraints/valid-uri"));

var _validDate = _interopRequireDefault(require("./constraints/valid-date"));

var _validDateTime = _interopRequireDefault(require("./constraints/valid-date-time"));

var _validInteger = _interopRequireDefault(require("./constraints/valid-integer"));

var _positiveNumber = _interopRequireDefault(require("./constraints/positive-number"));

var _conceptScheme = _interopRequireDefault(require("./constraints/concept-scheme"));

var _validYear = _interopRequireDefault(require("./constraints/valid-year"));

var _validEmail = _interopRequireDefault(require("./constraints/valid-email"));

var _validIban = _interopRequireDefault(require("./constraints/valid-iban"));

var _validPhoneNumber = _interopRequireDefault(require("./constraints/valid-phone-number"));

var _vlabelExtraTaxrateOrAmount = _interopRequireDefault(require("./constraints/vlabel-extra-taxrate-or-amount"));

var _validBoolean = _interopRequireDefault(require("./constraints/valid-boolean"));

var _validChildcareSubsidyTable = _interopRequireDefault(require("./constraints/valid-childcare-subsidy-table"));

var _vlabelSingleInstanceTaxRateOrExtraTaxRate = _interopRequireDefault(require("./constraints/vlabel-single-instance-tax-rate-or-extra-tax-rate"));

var _maxLength = _interopRequireDefault(require("./constraints/max-length"));

var _validEngagementTable = _interopRequireDefault(require("./constraints/valid-engagement-table"));

var _hasOneNumberGreaterThanInFields = _interopRequireDefault(require("./constraints/has-one-number-greater-than-in-fields"));

var _matchValues = _interopRequireDefault(require("./constraints/match-values"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function constraintForUri(uri) {
  switch (String(uri)) {
    case "http://lblod.data.gift/vocabularies/forms/RequiredConstraint":
      return _required.default;

    case "http://lblod.data.gift/vocabularies/forms/SingleCodelistValue":
      return _singleCodelistValue.default;

    case "http://lblod.data.gift/vocabularies/forms/ContainsCodelistValue":
      return _containsCodelistValue.default;

    case "http://lblod.data.gift/vocabularies/forms/Codelist":
      return _codelist.default;

    case "http://lblod.data.gift/vocabularies/forms/ExactValueConstraint":
      return _exactValue.default;

    case "http://lblod.data.gift/vocabularies/forms/UriConstraint":
      return _validUri.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidDate":
      return _validDate.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidDateTime":
      return _validDateTime.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidInteger":
      return _validInteger.default;

    case "http://lblod.data.gift/vocabularies/forms/PositiveNumber":
      return _positiveNumber.default;

    case "http://lblod.data.gift/vocabularies/forms/ConceptSchemeConstraint":
      return _conceptScheme.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidYear":
      return _validYear.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidEmail":
      return _validEmail.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidIBAN":
      return _validIban.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidPhoneNumber":
      return _validPhoneNumber.default;

    case "http://lblod.data.gift/vocabularies/forms/VlabelExtraTaxRateOrAmountConstraint":
      return _vlabelExtraTaxrateOrAmount.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidBoolean":
      return _validBoolean.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidChildcareSubsidyTable":
      return _validChildcareSubsidyTable.default;

    case "http://lblod.data.gift/vocabularies/forms/VlabelSingleInstanceTaxRateOrExtraTaxRate":
      return _vlabelSingleInstanceTaxRateOrExtraTaxRate.default;

    case "http://lblod.data.gift/vocabularies/forms/MaxLength":
      return _maxLength.default;

    case "http://lblod.data.gift/vocabularies/forms/ValidEngagementTable":
      return _validEngagementTable.default;

    case "http://lblod.data.gift/vocabularies/forms/HasOneNumberGreaterThanInFields":
      return _hasOneNumberGreaterThanInFields.default;

    case "http://lblod.data.gift/vocabularies/forms/MatchValues":
      return _matchValues.default;

    default:
      return false;
    //TODO: TBD
  }
}

function check(constraintUri, options) {
  const {
    formGraph,
    sourceNode,
    sourceGraph,
    store
  } = options;
  let path = store.any(constraintUri, (0, _namespaces.SHACL)("path"), undefined, formGraph);
  let triplesData = (0, _importTriplesForForm.triplesForPath)({
    store: store,
    path,
    formGraph: formGraph,
    sourceNode: sourceNode,
    sourceGraph: sourceGraph
  });
  return checkTriples(constraintUri, triplesData, options);
}

function checkTriples(constraintUri, triplesData, options) {
  const {
    formGraph,
    metaGraph,
    store,
    sourceNode,
    sourceGraph
  } = options;
  let values = triplesData.values;
  const validationType = store.any(constraintUri, (0, _namespaces.RDF)('type'), undefined, formGraph);
  const groupingType = store.any(constraintUri, (0, _namespaces.FORM)("grouping"), undefined, formGraph).value;
  const resultMessage = (store.any(constraintUri, (0, _namespaces.SHACL)("resultMessage"), undefined, formGraph) || "").value;
  let validator = constraintForUri(validationType && validationType.value);
  if (!validator) return {
    hasValidation: false,
    valid: true,
    resultMessage
  };
  const validationOptions = {
    store,
    metaGraph,
    constraintUri,
    sourceNode,
    sourceGraph,
    formGraph
  };
  let validationResult;
  /*
   * - Bag: validator is expected to be able to do some custom validation a collection off values
   * - MatchSome: validator can only process one value BUT only some (1 or more) off those values that get passed to the validator have to adhere
   * - MatchEvery: validator can only process one value BUT all values that get passed to the validator have to adhere
  */

  if (groupingType == (0, _namespaces.FORM)("Bag").value) {
    validationResult = validator(values, validationOptions);
  } else if (groupingType == (0, _namespaces.FORM)("MatchSome").value) {
    validationResult = values.some(value => validator(value, validationOptions));
  } else if (groupingType == (0, _namespaces.FORM)("MatchEvery").value) {
    validationResult = values.every(value => validator(value, validationOptions));
  } // console.log(`Validation ${validationType} [${groupingType}] with values ${values.join(',')} is ${validationResult}`);


  return {
    validationType: validationType.value,
    hasValidation: true,
    valid: validationResult,
    resultMessage
  };
}