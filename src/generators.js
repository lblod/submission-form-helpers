import { v4 as uuidv4 } from "uuid";
import { FORM, MU, RDF } from "./namespaces.js";
import { NamedNode, Statement } from "rdflib";

const DEFAULT_URI_TEMPLATE = "http://data.lblod.info/form-data/nodes/";

export function generatorsForNode(node, options) {
  const { store, formGraph } = options;
  const createGenerators = store
    .match(node, FORM("createGenerator"), undefined, formGraph)
    .map((t) => t.object);
  const initGenerators = store
    .match(node, FORM("initGenerator"), undefined, formGraph)
    .map((t) => t.object);
  const augmentGenerators = store
    .match(node, FORM("augmentGenerator"), undefined, formGraph)
    .map((t) => t.object);
  return { createGenerators, initGenerators, augmentGenerators };
}

export function triplesForGenerator(generatorUri, options) {
  const { store, formGraph } = options;
  const prototypeUri = store.any(
    generatorUri,
    FORM("prototype"),
    undefined,
    formGraph
  );
  const shapeUri = store.any(prototypeUri, FORM("shape"), undefined, formGraph);

  let dataset = walkAndGenerateShape(shapeUri, options);

  //TODO: currently just one source node is generated. Support cardinalities later
  dataset = { sourceNodes: [dataset.sourceNode], triples: dataset.triples };
  dataset = augmentGeneratedDataSet(generatorUri, dataset, {
    store,
    formGraph,
  });

  return dataset;
}

function walkAndGenerateShape(
  shapeUri,
  options,
  dataset = { sourceNode: [], triples: [] }
) {
  const { store, formGraph } = options;
  const shapeElements = store.match(shapeUri, undefined, undefined, formGraph);

  let nextSubject = new NamedNode(
    helpGenerateUri(shapeElements, { store, formGraph })
  );

  dataset.sourceNode = nextSubject;

  for (const shapeElement of shapeElements) {
    if (shapeElement.object.termType == "BlankNode") {
      const nestedDataset = walkAndGenerateShape(shapeElement.object, options);

      dataset.triples.push(
        new Statement(
          nextSubject,
          shapeElement.predicate,
          nestedDataset.sourceNode
        )
      );

      dataset.triples = [...dataset.triples, ...nestedDataset.triples];
    } else {
      dataset.triples.push(
        new Statement(nextSubject, shapeElement.predicate, shapeElement.object)
      );
    }
  }
  return dataset;
}

function augmentGeneratedDataSet(generatorUri, dataset, { store, formGraph }) {
  const dataGenerators = store.match(
    generatorUri,
    FORM("dataGenerator"),
    undefined,
    formGraph
  );

  for (const generator of dataGenerators) {
    if (generator.object.equals(FORM("addMuUuid"))) {
      const subjectValues = [
        ...new Set(dataset.triples.map((triple) => triple.subject.value)),
      ];
      const extraTriples = subjectValues.map((subjectV) => {
        return new Statement(new NamedNode(subjectV), MU("uuid"), uuidv4());
      });
      dataset.triples = [...dataset.triples, ...extraTriples];
    } else {
      console.warn(
        `Unsupported 'form:dataGenerator' for ${generator.object.value}`
      );
    }
  }
  return dataset;
}

function helpGenerateUri(shapeElements, { store, formGraph }) {
  const typeInformation = shapeElements.find((shape) =>
    shape.predicate.equals(RDF("type"))
  );
  if (typeInformation) {
    return newUriForType(typeInformation.object, { store, formGraph });
  } else {
    return DEFAULT_URI_TEMPLATE + uuidv4();
  }
}

function newUriForType(type, { store, formGraph }) {
  const uriGenerator = uriGeneratorForType(type, { store, formGraph });
  const prefix = store.any(uriGenerator, FORM("prefix"), undefined, formGraph);
  if (uriGenerator && prefix) {
    return prefix.value + uuidv4();
  } else {
    return DEFAULT_URI_TEMPLATE + uuidv4();
  }
}

function uriGeneratorForType(type, { store, formGraph }) {
  const uriGenerators = store.match(
    undefined,
    RDF("type"),
    FORM("UriGenerator"),
    formGraph
  );
  for (const generator of uriGenerators) {
    if (store.any(generator.subject, FORM("forType"), type, formGraph)) {
      return generator.subject;
    }
  }
  return null;
}
