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
2. run `npm install` to install all dependencies and run the initial build
3. run `npm run lint` and `npm run test` before creating a PR to catch any issues early.

## Testing your changes in other projects
### Frontend projects
1. install [yalc](https://github.com/wclr/yalc)
2. use [`yalc publish`](https://github.com/wclr/yalc) to publish your changes to a local repository
3. use [`yalc add`](https://github.com/wclr/yalc#add) in the folder of the project where you want to test the change.
4. use `yalc publish` and `yalc push` to push code changes to all the projects that `yalc add`ed the package

> `npm link` isn't working correctly in projects that use Webpack, so it's recommended to use `yalc` until that issue is resolved.

### Backend microservices
1. you can mount the volume to:
    - `/path/to/code/submission-form-helpers:/app/node_modules/@lblod/submission-form-helpers`
    - Expects the dist folder to be present, and you will have to restart the service
2. make your changes
3. run `npm run build` (babel will transpile to the `dist/` folder)
4. test inside your project

## Releasing
1. run `npm run release`
2. follow the release-it prompts
3. release-it pushes the tag to GitHub
4. Woodpecker will publish the new version to npm
