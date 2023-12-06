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

export function fieldsForSubForm(form, options) {
  return fieldsForFormModelV2(form, options);
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
  const formItems = store
    .match(form, FORM("includes"), undefined, formGraph)
    .map(({ object }) => object);
  const formItemsExceptHiddenConditionals = withoutHiddenConditionalFields(
    formItems,
    options
  );
  //Next line is to get conditional fields according to the old model
  const oldModelConditionals = fieldsForFormModelV1(form, options);
  return [...formItemsExceptHiddenConditionals, ...oldModelConditionals];
}

function withoutHiddenConditionalFields(
  formItems,
  { store, sourceNode, sourceGraph, metaGraph, formGraph }
) {
  return formItems.filter((formItem) => {
    const allConditionsMatch = store
      .match(formItem, FORM("rendersWhen"), undefined, formGraph)
      .every(({ object }) => {
        return check(object, {
          formGraph,
          store,
          sourceGraph,
          sourceNode,
          metaGraph,
        }).valid;
      });
    return allConditionsMatch;
  });
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
