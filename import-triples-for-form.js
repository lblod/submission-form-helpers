import { v4 as uuidv4 } from 'uuid';
import { check, checkTriples } from './constraints';
import { FORM, RDF, SHACL } from './namespaces';
import rdflib from "./rdflib-shim.js";

const URI_TEMPLATE = 'http://data.lblod.info/form-data/nodes/';

function importTriplesForForm(form, {store, formGraph, sourceGraph, sourceNode, metaGraph}) {
  let datasetTriples = [];
  for (let field of fieldsForForm(form, {store, formGraph, sourceGraph, sourceNode, metaGraph})) {
    let scopedSourceNodes = [ sourceNode ];
    const scope = getScope(field, {store, formGraph});
    if(scope){
      const scopedDataSet = triplesForScope(scope, { store, formGraph, sourceNode, sourceGraph });
      scopedSourceNodes = scopedDataSet.values;
    }

    for(const sourceNode of scopedSourceNodes){
      let path = store.any(field, SHACL("path"), undefined, formGraph);
      triplesForPath({path, store, formGraph, sourceNode, sourceGraph})
        .triples
        .forEach((item) => datasetTriples.push(item));
    }
  }

  return datasetTriples;
}

function fieldsForForm(form, options) {
  let fields = [];
  if(isFormModelV2(form, options)) {
    fields = fieldsForFormModelV2(form, options);
  } else {
    fields = fieldsForFormModelV1(form, options);
  }
  return fields;
}

function isFormModelV2(form, { store, formGraph }) {
  const isTopLevelForm = store.any(form, RDF('type'), FORM('TopLevelForm'), formGraph);
  const isSubForm = store.any(form, RDF('type'), FORM('SubForm'), formGraph);
  return isTopLevelForm || isSubForm;
}

function getFormModelVersion(form, { store, formGraph }) {
  if(isFormModelV2(form, { store, formGraph })) {
    return "v2";
  }
  else return "v1";
}

function fieldsForFormModelV2(form, options) {
  let { store, formGraph, sourceGraph, sourceNode, metaGraph } = options;
  //TODO: conditionals (also to define in form model)
  const formItems = store.match(form, FORM('includes'), undefined, formGraph).map( ({ object }) => object);
  //Next line is to get conditional fields. This is currently still supported in th V1 model TODO: migrate to V4 support
  const conditional = fieldsForFormModelV1(form, options);
  return [...formItems, ...conditional];
}

function fieldsForFormModelV1(form, options) {
  let { store, formGraph, sourceGraph, sourceNode, metaGraph } = options;

  // get field groups
  let fieldGroups = store.match(form, FORM("hasFieldGroup"), undefined, formGraph);
  // console.log(`Getting fields for ${fieldGroups.length} field groups`);
  fieldGroups = [].concat(...fieldGroups);
  fieldGroups = fieldGroups.map(({object}) => object);

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
    let conditionalFieldGroups =
      newFields.map((field) => {
        return store
          .match(field, FORM("hasConditionalFieldGroup"), undefined, formGraph)
          .map(({object}) => object);
      });
    conditionalFieldGroups = [].concat(...conditionalFieldGroups);

    // add matching conditional field groups
    let newFieldGroups =
      conditionalFieldGroups
        .filter((group) => {
          return store
            .match(group, FORM("conditions"), undefined, formGraph)
            .every(({object}) => check(object, {formGraph, sourceNode, sourceGraph, metaGraph, store}).valid);
        })
        .map((group) => {
          return store
            .match(group, FORM("hasFieldGroup"), undefined, formGraph)
            .map(({object}) => object);
        });
    newFieldGroups = [].concat(...newFieldGroups);
    fieldGroups = newFieldGroups;
  }

  return allFields;
}

function fieldsForFieldGroup(fieldGroup, options) {
  const {store, formGraph} = options;

  return store
    .match(fieldGroup, FORM("hasField"), undefined, formGraph)
    .map(({object}) => object);
}

function triplesForPath(options, createMissingNodes = false) {
  const {store, path, formGraph, sourceNode, sourceGraph} = options;
  let solutions = {};
  if (path && path.termType === "Collection") {
    return triplesForComplexPath(options, createMissingNodes);
  } else {
    return triplesForSimplePath(options, createMissingNodes);
  }
}

function triplesForSimplePath(options, createMissingNodes = false) {
  const { store, path, formGraph, sourceNode, sourceGraph, scope } = options;
  let datasetTriples = [];
  let values = [];
  let startNodes = [ sourceNode ];
  if(scope){
    //TODO: what if none?
    const scopedDataSet = triplesForScope(scope, { store, formGraph, sourceNode, sourceGraph });
    startNodes = scopedDataSet.values;
    datasetTriples = [ ...datasetTriples, ...scopedDataSet.triples ];
  }

  //TODO: why if no path? -> this should be an error-state
  if (path) {
    for(const sourceNode of startNodes){

      const triples = store.match(sourceNode, path, undefined, sourceGraph);

      if (createMissingNodes && triples.length == 0) {
        triples.push(new rdflib.Statement(
          sourceNode,
          path,
          new rdflib.NamedNode(URI_TEMPLATE + uuidv4()),
          sourceGraph
        ));
      }

      values = [ ...values, ...triples.map(({object}) => object) ];

      datasetTriples = [ ...datasetTriples, ...triples] ;
    }
  }

  return { triples: datasetTriples, values,
           orderedSegmentData: [
             {
               pathElement: { path },
               triples: datasetTriples,
               values
             }
           ]
         };
}

function triplesForComplexPath(options, createMissingNodes = false) {
  const { store, path, formGraph, sourceNode, sourceGraph, scope } = options;
  let datasetTriples = [];

  // Convert PATH list to comprehensible objects
  const pathElements =
    path
      .elements
      .map((element) => {
        if (element.termType == "NamedNode") {
          return {path: element};
        } else {
          const elementInfo = store.any(element, SHACL("inversePath"), undefined, formGraph);
          return {inversePath: elementInfo};
        }
      });

  // Walk over each part of the path list
  let startingPoints = [sourceNode];
  const orderedSegmentData = [];

  if(scope){
    //TODO: what if none?
    const scopedDataSet = triplesForScope(scope, { store, formGraph, sourceNode, sourceGraph });
    startingPoints = scopedDataSet.values;
    datasetTriples = [ ...datasetTriples, ...scopedDataSet.triples ];
  }

  let nextPathElements = pathElements;
  while (nextPathElements.length) {
    // walk one segment of the path list
    let [currentPathElement, ...restPathElements] = nextPathElements;

    const segmentData = { pathElement: currentPathElement, triples: [], values: [] };

    for (let startingPoint of startingPoints) {
      if (currentPathElement.inversePath) {

        // inverse path, walk in other direction
        const triples = store.match(undefined, currentPathElement.inversePath, startingPoint, sourceGraph);

        if (createMissingNodes && triples.length == 0) {
          triples.push(new rdflib.Statement(
            new rdflib.NamedNode(URI_TEMPLATE + uuidv4()),
            currentPathElement.inversePath,
            startingPoint,
            sourceGraph
          ));
        }

        triples.map((triple) => {
          datasetTriples.push(triple);
          segmentData.triples.push(triple);
          segmentData.values.push(triple.subject);
        });

      } else {

        // regular path, walk in normal direction
        const triples = store.match(startingPoint, currentPathElement.path, undefined, sourceGraph);

        if (createMissingNodes && triples.length == 0) {
          triples.push(new rdflib.Statement(
            startingPoint,
            currentPathElement.path,
            new rdflib.NamedNode(URI_TEMPLATE + uuidv4()),
            sourceGraph
          ));
        }

        triples.map((triple) => {
          datasetTriples.push(triple);
          segmentData.triples.push(triple);
          segmentData.values.push(triple.object);
        });
      }
    }

    // update state for next loop
    startingPoints = segmentData.values;
    nextPathElements = restPathElements;

    orderedSegmentData.push(segmentData);
  }

  // (this is reduntant, if there are no startingPoints values will
  // always be an array, but it's more obvious ;-)
  if (nextPathElements.length == 0)
    return { triples: datasetTriples, values: startingPoints, orderedSegmentData };
  else
    return { triples: datasetTriples, values: [], orderedSegmentData };
}

function getScope(field, options) {
  const { store, formGraph } = options;
  const scope = store.any(field, FORM("scope"), undefined, formGraph);
  return scope;
}

//Note: scope can match multiple nodes
function triplesForScope(scopeUri, options) {

  const { store, formGraph, sourceNode, sourceGraph } = options;
  let path = store.any(scopeUri, SHACL("path"), undefined, formGraph);
  const dataset = triplesForPath({ store, path, formGraph, sourceNode, sourceGraph });

  //TODO: probably this could be more performant
  //TODO: support other types of constraints?
  let constraints = store.match(scopeUri, FORM('constraint'), undefined, formGraph)
      .filter(constraint => store.any(constraint.object, RDF('type'), SHACL('NodeShape'), formGraph))
      .map(constraint => store.match(constraint.object, SHACL('property'), undefined, formGraph))
      .reduce((acc, properties) => { return [...acc, ...properties ]; }, [])
      .map(property => {
                return {
                  path: store.any(property.object, SHACL('path'), undefined, formGraph),
                  targetNode: store.any(property.object, SHACL('targetNode'), undefined, formGraph)
                };
        });

  // filter out values which don't match shapes
  // Note: the filtered data changes  are applied in place
  const orderedSegmentData = dataset.orderedSegmentData;
  const lastSegmentData = orderedSegmentData.slice(-1)[0];

  for(const value of [ ...lastSegmentData.values ]) {
    for(const constraint of constraints){
      const objects = triplesForPath({ store, path: constraint.path, formGraph, sourceNode: value, sourceGraph }).values;

      if(!objects.find(o => o.equals(constraint.targetNode))) {

        lastSegmentData.values = lastSegmentData.values.filter(v => !v.equals(value));

        if(lastSegmentData.pathElement.inversePath) {
          lastSegmentData.triples = lastSegmentData.triples.filter(t => !t.subject.equals(value));
        }
        else {
          lastSegmentData.triples = lastSegmentData.triples.filter(t => !t.object.equals(value));
        }
      }
    }
  }

  const filteredTriples = orderedSegmentData.reduce( (acc, segment) => {
    return [...acc, ...segment.triples];
  }, []);

  return { triples: filteredTriples, values: lastSegmentData.values, orderedSegmentData };
}

function validateForm(form, options) {
  const {store, formGraph, sourceGraph, sourceNode, metaGraph} = options;
  const fields = fieldsForForm(form, options);
  const fieldValidations = fields.map(field => validateField(field, options));
  return fieldValidations.reduce((acc, value) => acc && value, true);
}

function validateField(fieldUri, options) {
  return validationResultsForField(fieldUri, options).reduce((acc, value) => acc && value.valid, true);
}

function validationResultsForField(fieldUri, options) {
  const { store, formGraph } = options;
  const validationConstraints = store.match(fieldUri, FORM("validations"), undefined, formGraph)
        .map(t => t.object);

  const validationResults = [];
  for (const constraintUri of validationConstraints) {
    const validationResult = check(constraintUri, options);
    validationResults.push(validationResult);
  }
  return validationResults;
}

function validationTypesForField(fieldUri, options){
  const { store, formGraph } = options;
  const validationConstraints = store
    .match(fieldUri, FORM("validations"), undefined, formGraph)
        .map(t => t.object);

  const validationTypes = validationConstraints
        .map( constraintS => store.match(constraintS, RDF('type'), undefined, formGraph)[0]) //There must be a least once
        .map(triple => triple.object);
  return validationTypes;
}

function validationResultsForFieldPart(triplesData, fieldUri, options){
  const { store, formGraph } = options;
  const validationConstraints = store
    .match(fieldUri, FORM("validations"), undefined, formGraph)
    .map(t => t.object);

  const validationResults = [];
  for (const constraintUri of validationConstraints) {
    const validationResult = checkTriples(constraintUri, triplesData, options);
    validationResults.push(validationResult);
  }
  return validationResults;
}

function updateSimpleFormValue(options, newValue = null, oldValue = null) {

  /* This might be tricky.We need to find a subject and predicate to attach the object to.
* The path might contain several hops, and some of them don't necessarly exist. Consider:
*
*  Suppose our path is
*  sh:path ( [ sh:inversePath besluit:heeftBesluitenlijst ] prov:startedAtTime )
*
*  and we only have
*
*  <besluitenlijst> a <Besluitenlijst>
*
*  A path will then be constructed with
*   <customUri> <prov:startedAtTime> "datum".
*   <customUri> <heeftBesluitenlijst> <besluitenlijst>.
*
* TODO: this is for now a best guess. And further tweaking will be needed. If this needs to be our model:
*  <zitting> a <Zitting>
*  <zitting> <prov:startedAtTime> "datum".
*  <zitting> <heeftBesluitenlijst> <besluitenlijst>.
*  <besluitenlijst> a <Besluitenlijst>
*
* And suppose the data store does not have:
*  <zitting> <prov:startedAtTime> "datum".
*  <zitting> <heeftBesluitenlijst> <besluitenlijst>.
*
* Then the above described solution will not work. Because our <customUri> is not linked to a <Zitting>.
*/

  if(oldValue)
    removeDatasetForSimpleFormValue(oldValue, options);
  if(newValue)
    addSimpleFormValue(newValue, options);
}

function removeDatasetForSimpleFormValue(value, options) {
  const { store } = options;

  //This returns the complete chain of triples for the path, if there something missing, new nodes are added.
  const dataset = triplesForPath(options, true);
  const triplesToRemove = dataset.triples.filter(t => t.object.equals(value));
  store.removeStatements(triplesToRemove);
}

/**
 * Removes all triples for the given options
 * HARD RESET
 */
function removeTriples(options) {
  const { store } = options;

  const dataset = triplesForPath(options, true);
  store.removeStatements(dataset.triples);
}

function removeSimpleFormValue(value, options) {
  const { store } = options;

  //This returns the complete chain of triples for the path, if there something missing, new nodes are added.
  const dataset = triplesForPath(options, true);

  let triplesToRemove = [];
  // The reason why it is more complicated. If we encounter > 1 values for a path, the I expect this form
  // to be broken. This is a way for ther user to correct and remove both values.
  if (dataset.values.length > 0) {
    triplesToRemove = dataset.triples.filter(t => !dataset.values.find(v => t.object.equals(v)));
  }

  if (value) {
    const newTriple = dataset.triples.slice(-1)[0];
    newTriple.object = value;
    triplesToRemove.push(newTriple);
  }

  store.removeStatements(triplesToRemove);
}

function addSimpleFormValue(value, options) {
  const {store, formGraph, sourceGraph, sourceNode, metaGraph} = options;

  //This returns the complete chain of triples for the path, if there something missing, new nodes are added.
  const dataset = triplesForPath(options, true);

  let triplesToAdd = [];
  // The reason why it is more complicated. If we encounter > 1 values for a path, the I expect this form
  // to be broken. This is a way for ther user to correct and remove both values.
  if (dataset.values.length > 0) {
    triplesToAdd = dataset.triples.filter(t => !dataset.values.find(v => t.object.equals(v)));
  }

  if (value) {
    const newTriple = dataset.triples.slice(-1)[0];
    newTriple.object = value;
    triplesToAdd.push(newTriple);
  }

  store.addAll(triplesToAdd);
}

export default importTriplesForForm;
export {
    getFormModelVersion,
    triplesForPath,
    triplesForScope,
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
};
