import { check } from "./constraints.js";
import { FORM, RDF } from "./namespaces.js";

export function fieldsForForm(form, options) {
  let fields = [];
  if (isFormModelV2(form, options)) {
    fields = fieldsForFormModelV2(form, options);
  } else {
    fields = fieldsForFormModelV1(form, options);
  }
  return fields;
}

export function getFormModelVersion(form, { store, formGraph }) {
  if (isFormModelV2(form, { store, formGraph })) {
    return "v2";
  } else return "v1";
}

function isFormModelV2(form, { store, formGraph }) {
  const isTopLevelForm = store.any(
    form,
    RDF("type"),
    FORM("TopLevelForm"),
    formGraph
  );
  const isSubForm = store.any(form, RDF("type"), FORM("SubForm"), formGraph);
  return isTopLevelForm || isSubForm;
}

function fieldsForFormModelV2(form, options) {
  let { store, formGraph } = options;
  //TODO: conditionals (also to define in form model)
  const formItems = store
    .match(form, FORM("includes"), undefined, formGraph)
    .map(({ object }) => object);
  //Next line is to get conditional fields. This is currently still supported in th V1 model TODO: migrate to V4 support
  const conditional = fieldsForFormModelV1(form, options);
  return [...formItems, ...conditional];
}

function fieldsForFormModelV1(form, options) {
  let { store, formGraph, sourceGraph, sourceNode, metaGraph } = options;

  // get field groups
  let fieldGroups = store.match(
    form,
    FORM("hasFieldGroup"),
    undefined,
    formGraph
  );
  // console.log(`Getting fields for ${fieldGroups.length} field groups`);
  fieldGroups = [].concat(...fieldGroups);
  fieldGroups = fieldGroups.map(({ object }) => object);

  // get all fields recursively
  let allFields = [];
  let newFields = [];

  while (fieldGroups.length > 0) {
    // add fields
    newFields = [];
    for (const fieldGroup of fieldGroups)
      newFields.push(...fieldsForFieldGroup(fieldGroup, options));

    allFields.push(...newFields);

    // calculate conditional groups
    let conditionalFieldGroups = newFields.map((field) => {
      return store
        .match(field, FORM("hasConditionalFieldGroup"), undefined, formGraph)
        .map(({ object }) => object);
    });
    conditionalFieldGroups = [].concat(...conditionalFieldGroups);

    // add matching conditional field groups
    let newFieldGroups = conditionalFieldGroups
      .filter((group) => {
        return store
          .match(group, FORM("conditions"), undefined, formGraph)
          .every(
            ({ object }) =>
              check(object, {
                formGraph,
                sourceNode,
                sourceGraph,
                metaGraph,
                store,
              }).valid
          );
      })
      .map((group) => {
        return store
          .match(group, FORM("hasFieldGroup"), undefined, formGraph)
          .map(({ object }) => object);
      });
    newFieldGroups = [].concat(...newFieldGroups);
    fieldGroups = newFieldGroups;
  }

  return allFields;
}

function fieldsForFieldGroup(fieldGroup, options) {
  const { store, formGraph } = options;

  return store
    .match(fieldGroup, FORM("hasField"), undefined, formGraph)
    .map(({ object }) => object);
}
