# @lblod/submission-form-helpers
NPM package containing helpers to inspect and validate submission forms

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

import { constraintForUri } from "@lblod/submission-form-helpers"
```

## Development
1. clone this repo
2. npm link/install inside your project
3. make your changes
4. run `npm build` (babel will transpile to the `dist/` folder)
5. test inside your project
6. bump the version number in `package.json`
7. create a git tag
8. run `npm publish` (requires npm permissions)



