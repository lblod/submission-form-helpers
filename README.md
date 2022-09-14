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
  - In an ember-project, I link it both in the addon and the host-app. (And it doesn't get automatically picked up).
  - In a mu-backend, you can mount the volume to:
    - `/path/to/code/submission-form-helpers:/app/node_modules/@lblod/submission-form-helpers`
    - Expects the dist folder to be present, and you will have to restart the service
3. make your changes
4. run `npm run prepare` (babel will transpile to the `dist/` folder)
5. test inside your project

## Releasing
1. run `npm run release`
2. follow the release-it prompts
3. release-it pushes the tag to GitHub
4. Woodpecker will publish the new version to npm
