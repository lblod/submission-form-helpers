## v3.0.0 (2025-07-14)

#### :boom: Breaking Change
* [#71](https://github.com/lblod/submission-form-helpers/pull/71) LMB-1513 | Async custom validations ([@JonasVanHoof](https://github.com/JonasVanHoof))

## v2.10.3 (2025-05-28)

#### :bug: Bug Fix
* [#69](https://github.com/lblod/submission-form-helpers/pull/69) [LPDC-1425] Fix an issue with the `addMuUuid` generator ([@Windvis](https://github.com/Windvis))

## v2.10.0 (2024-03-26)

#### :rocket: Enhancement
* [#65](https://github.com/lblod/submission-form-helpers/pull/65) allow registering custom validators ([@Rahien](https://github.com/Rahien))

## v2.9.0 (2024-01-29)

#### :rocket: Enhancement

- [#63](https://github.com/lblod/submission-form-helpers/pull/63) [DL-5623] Add a new `DateInPast` constraint ([@Windvis](https://github.com/Windvis))

## v2.8.0 (2024-01-24)

#### :rocket: Enhancement

- [#62](https://github.com/lblod/submission-form-helpers/pull/62) [DL-5621] Support validation constraint "severity" ([@Windvis](https://github.com/Windvis))

## v2.7.0 (2024-01-15)

#### :rocket: Enhancement

- [#61](https://github.com/lblod/submission-form-helpers/pull/61) add exported function to get validations and type together ([@Rahien](https://github.com/Rahien))

## v2.6.0 (2024-01-10)

#### :rocket: Enhancement

- [#55](https://github.com/lblod/submission-form-helpers/pull/55) Add support for the `form:validatedBy` predicate ([@Rahien](https://github.com/Rahien))

## v2.5.1 (2023-12-21)

#### :bug: Bug Fix

- [#54](https://github.com/lblod/submission-form-helpers/pull/54) Prevent the uuid generator from adding extra uuids if a uuid already exists ([@Rahien](https://github.com/Rahien))

## v2.5.0 (2023-12-12)

#### :rocket: Enhancement

- [#52](https://github.com/lblod/submission-form-helpers/pull/52) Add support for the v2 data model "conditions" ([@Rahien](https://github.com/Rahien))

## v2.4.0 (2023-11-29)

#### :rocket: Enhancement

- [#51](https://github.com/lblod/submission-form-helpers/pull/51) Add negative path constraints ([@Rahien](https://github.com/Rahien))
- [#49](https://github.com/lblod/submission-form-helpers/pull/49) Reduce the bundle size of the `valid-uri` constraint ([@Windvis](https://github.com/Windvis))

## v2.3.0 (2023-05-02)

#### :rocket: Enhancement

- [#46](https://github.com/lblod/submission-form-helpers/pull/46) Also validate sub forms in `validateForms` ([@Windvis](https://github.com/Windvis))

#### :house: Internal

- [#45](https://github.com/lblod/submission-form-helpers/pull/45) Extract helpers from the `import-triples-for-form` file ([@Windvis](https://github.com/Windvis))
- [#43](https://github.com/lblod/submission-form-helpers/pull/43) List forking-store as a peerDep ([@Windvis](https://github.com/Windvis))

## v2.2.0 (2023-02-08)

#### :rocket: Enhancement

- [#38](https://github.com/lblod/submission-form-helpers/pull/38) Update `uuid` to v9 ([@Windvis](https://github.com/Windvis))
- [#28](https://github.com/lblod/submission-form-helpers/pull/28) Also export the MU namespace ([@Windvis](https://github.com/Windvis))

#### :house: Internal

- [#30](https://github.com/lblod/submission-form-helpers/pull/30) Enable prettier ([@Windvis](https://github.com/Windvis))
- [#34](https://github.com/lblod/submission-form-helpers/pull/34) Add a basic unit testing setup ([@Windvis](https://github.com/Windvis))
- [#31](https://github.com/lblod/submission-form-helpers/pull/31) Use root level conditions ([@Windvis](https://github.com/Windvis))
- [#29](https://github.com/lblod/submission-form-helpers/pull/29) Use an index.js file as the entry point ([@Windvis](https://github.com/Windvis))
