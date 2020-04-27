# @lblod/submission-form-helpers
npm package containing 

## Installation
`npm install @lblod/submission-form-helpers`

## Usage
```
import {
  triplesForPath,
  fieldsForForm,
  validateForm,
  validateField,
  validationTypesForField,
  validationResultsForField,
  validationResultsForFieldPart,
  updateSimpleFormValue,
  addSimpleFormValue,
  removeSimpleFormValue,
  removeDatasetForSimpleFormValue,
  removeTriples,
  importTriplesForForm
}  from "@lblod/submission-form-helpers"

import { RDF, FORM, SHACL, SKOS, XSD, DCT, NIE } from "@lblod/submission-form-helpers"

import { check, checkTriples } from "@lblod/submission-form-helpers"

import {constraintForUri} from "@lblod/submission-form-helpers"
```

## Development
clone this repo
npm link/install inside your project
make your changes
run `npm build`
test inside your project
run `npm publish` (requires npm permissions)



