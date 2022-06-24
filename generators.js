import { v4 as uuidv4 } from 'uuid';
import { FORM, MU } from './namespaces';
import rdflib from "./rdflib-shim.js";

const URI_TEMPLATE = 'http://data.lblod.info/form-data/nodes/';

export function generatorsForNode(node, options) {
  const { store, formGraph } = options;
  const createGenerators = store.match(node, FORM("createGenerator"), undefined, formGraph).map(t => t.object);
  const initGenerators = store.match(node, FORM("initGenerator"), undefined, formGraph).map(t => t.object);
  const augmentGenerators = store.match(node, FORM("augmentGenerator"), undefined, formGraph).map(t => t.object);
  return { createGenerators, initGenerators, augmentGenerators };
}

export function triplesForGenerator(generatorUri, options) {
  const { store, formGraph } = options;
  const prototypeUri = store.any(generatorUri, FORM('prototype'), undefined, formGraph);
  const shapeUri = store.any(prototypeUri, FORM('shape'), undefined, formGraph);

  let dataset = walkAndGenerateShape(shapeUri, options);

  //TODO: currently just one source node is generated. Support cardinalities later
  dataset = { sourceNodes: [ dataset.sourceNode ], triples: dataset.triples };
  dataset = augmentGeneratedDataSet(generatorUri, dataset, { store, formGraph });

  return dataset;
}

function walkAndGenerateShape(shapeUri, options , dataset = { sourceNode: [], triples: [] }) {
  const { store, formGraph } = options;
  const shapeElements = store.match(shapeUri, undefined, undefined, formGraph);

  let nextSubject = new rdflib.NamedNode(URI_TEMPLATE + uuidv4());

  dataset.sourceNode = nextSubject;

  for(const shapeElement of shapeElements) {

    if(shapeElement.object.termType == "BlankNode") {
      const nestedDataset = walkAndGenerateShape(shapeElement.object, options);

        dataset.triples.push(
          new rdflib.Statement(nextSubject, shapeElement.predicate, nestedDataset.sourceNode)
        );

      dataset.triples = [ ...dataset.triples, ...nestedDataset.triples];
    }
    else {
      dataset.triples.push(
        new rdflib.Statement(nextSubject, shapeElement.predicate, shapeElement.object)
      );
    }
  }
  return dataset;
}

function augmentGeneratedDataSet(generatorUri, dataset, { store, formGraph }) {
  const dataGenerators = store.match(generatorUri, FORM('dataGenerator'), undefined, formGraph);

  for(const generator of dataGenerators) {
    if(generator.object.equals(FORM('addMuUuid'))){
      const subjectValues = [ ...new Set(dataset.triples.map(triple => triple.subject.value)) ];
      const extraTriples = subjectValues.map(subjectV => {
        return new rdflib.Statement(new rdflib.NamedNode(subjectV), MU('uuid'), uuidv4());
      });
      dataset.triples = [ ...dataset.triples, ...extraTriples ];
    }
    else {
      console.warn(`Unsupported 'form:dataGenerator' for ${generator.object.value}`);
    }
  }
  return dataset;
}
