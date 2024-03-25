# @lblod/submission-form-helpers

NPM package containing helpers to inspect and validate submission forms

## Installation

`npm install @lblod/submission-form-helpers`

## Usage

```
import {
  getFormrModelVersion,
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
  importTriplesForForm,
  generatorsForNode,
  triplesForGenerator
}  from "@lblod/submission-form-helpers"

import { RDF, FORM, SHACL, SKOS, XSD, DCT, NIE, MU } from "@lblod/submission-form-helpers"

import { check, checkTriples } from "@lblod/submission-form-helpers"

import constraintForUri from "@lblod/submission-form-helpers"
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

## Releasing a new version

We use [`release-it`](https://github.com/release-it/release-it) to handle our release flow

### Prerequisites

- All PRs that need to show up in the changelog need a descriptive title and [correct label].

### Generating the changelog (optional)

At the moment the changelog is updated manually. To make this a bit easier you can generate a basic changelog based on the merged PRs with [`lerna-changelog`](https://github.com/lerna/lerna-changelog).

> `lerna-changelog` requires a Github [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to work properly.

The following command can be used to generate the changelog:

`GITHUB_AUTH=your-access-token npx lerna-changelog`

### Creating a new release

Simply run `npm run release` and follow the prompts.

> If you generated the changelog using lerna-changelog you can add it to the changelog file and add it to the staged changes when release-it asks if you want to commit the changes. This will ensure that the changelog change is part of the release commit.

After the new tag is created and pushed CI will take care of publishing the package to npm.
