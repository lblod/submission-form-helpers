import { asyncEvery, check } from "./constraints.js";
import { FORM, RDF } from "./namespaces.js";

export async function fieldsForForm(form, options) {
  if (isFormModelV2(form, options)) {
    return fieldsForFormModelV2(form, options);
  }

  return fieldsForFormModelV1(form, options);
}

export async function fieldsForSubForm(form, options) {
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

async function fieldsForFormModelV2(form, options) {
  let { store, formGraph } = options;
  const formItems = store
    .match(form, FORM("includes"), undefined, formGraph)
    .map(({ object }) => object);
  const formItemsExceptHiddenConditionals =
    await withoutHiddenConditionalFields(formItems, options);

  return formItemsExceptHiddenConditionals;
  //Next line is to get conditional fields according to the old model
  // TODO: uncomment when the v2 fields work
  // const oldModelConditionals = fieldsForFormModelV1(form, options);
  // return [...formItemsExceptHiddenConditionals, ...oldModelConditionals];
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

    // add matching conditional field groups
    let newFieldGroups = conditionalFieldGroups
      .filter((group) => {
        return store
          .match(group, FORM("conditions"), undefined, formGraph)
          .every(
            ({ object }) =>
              // TODO: check is an async functions
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
