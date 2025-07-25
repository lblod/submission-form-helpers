import { check } from "./constraints.js";
import { FORM, RDF } from "./namespaces.js";
import { asyncEvery } from "./private/async-array-methods.js";

export async function fieldsForForm(form, options) {
  if (isFormModelV2(form, options)) {
    return await fieldsForFormModelV2(form, options);
  }

  return await fieldsForFormModelV1(form, options);
}

export async function fieldsForSubForm(form, options) {
  return await fieldsForFormModelV2(form, options);
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

async function fieldsForFormModelV2(form, options) {
  let { store, formGraph } = options;
  const formItems = store
    .match(form, FORM("includes"), undefined, formGraph)
    .map(({ object }) => object);
  const formItemsExceptHiddenConditionals =
    await withoutHiddenConditionalFields(formItems, options);

  //Next line is to get conditional fields according to the old model
  const oldModelConditionals = await fieldsForFormModelV1(form, options);
  return [...formItemsExceptHiddenConditionals, ...oldModelConditionals];
}

async function withoutHiddenConditionalFields(
  formItems,
  { store, sourceNode, sourceGraph, metaGraph, formGraph }
) {
  const fields = [];
  for (const formItem of formItems) {
    const conditions = store
      .match(formItem, FORM("rendersWhen"), undefined, formGraph)
      .map(({ object }) => object);

    const isValid = await asyncEvery(async (_value) => {
      const validationResult = await check(_value, {
        formGraph,
        store,
        sourceGraph,
        sourceNode,
        metaGraph,
      });

      return validationResult.valid;
    }, conditions);

    if (isValid) {
      fields.push(formItem);
    }
  }

  return fields;
}

async function fieldsForFormModelV1(form, options) {
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

    const groupsToAdd = [];
    for (const group of conditionalFieldGroups) {
      const conditions = store
        .match(group, FORM("conditions"), undefined, formGraph)
        .map(({ object }) => object);

      const isValid = await asyncEvery(async (_value) => {
        const validationResult = await check(_value, {
          formGraph,
          sourceNode,
          sourceGraph,
          metaGraph,
          store,
        });

        return validationResult.valid;
      }, conditions);

      if (isValid) {
        groupsToAdd.push(group);
      }
    }
    // add matching conditional field groups
    let newFieldGroups = groupsToAdd.map((group) => {
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
