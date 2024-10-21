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
  const { store, formGraph, sourceGraph, sourceNode } = options;
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
    sourceGraph,
    sourceNode,
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

function addExtraUuids(dataset, { store, sourceGraph, sourceNode }) {
  const subjectValues = [
    ...new Set(dataset.triples.map((triple) => triple.subject.value)),
  ];
  const extraTriples = [];
  subjectValues.forEach((subjectV) => {
    // this is because the dataset's source node can be renamed to the original source node of the form
    const trueSubject =
      subjectV === dataset.sourceNodes[0].value
        ? sourceNode
        : new NamedNode(subjectV);
    const alreadyHasUuid = store.any(
      trueSubject,
      MU("uuid"),
      undefined,
      sourceGraph
    );
    if (alreadyHasUuid) {
      return;
    }
    extraTriples.push(
      new Statement(new NamedNode(subjectV), MU("uuid"), uuidv4())
    );
  });
  return extraTriples;
}

function augmentGeneratedDataSet(generatorUri, dataset, storeOptions) {
  const { store, formGraph } = storeOptions;
  const dataGenerators = store.match(
    generatorUri,
    FORM("dataGenerator"),
    undefined,
    formGraph
  );

  for (const generator of dataGenerators) {
    if (generator.object.equals(FORM("addMuUuid"))) {
      dataset.triples = [
        ...dataset.triples,
        ...addExtraUuids(dataset, storeOptions),
      ];
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

// EXPERIMENTAL: lazy version of the generators that reuses paths in the shape if they exist and generates
// the missing tails of the path
export function triplesForLazyGenerator(generatorUri, options) {
  const { store, formGraph, sourceGraph, sourceNode } = options;
  const prototypeUri = store.any(
    generatorUri,
    FORM("prototype"),
    undefined,
    formGraph
  );
  const shapeUri = store.any(prototypeUri, FORM("shape"), undefined, formGraph);

  let dataset = walkAndGenerateShapeLazy(shapeUri, options, sourceNode);

  //TODO: currently just one source node is generated. Support cardinalities later
  dataset = { sourceNodes: [dataset.sourceNode], triples: dataset.triples };
  dataset = augmentGeneratedDataSet(generatorUri, dataset, {
    store,
    formGraph,
    sourceGraph,
    sourceNode,
  });

  return dataset;
}

function walkAndGenerateShapeLazy(
  shapeUri,
  options,
  sourceNode,
  dataset = { sourceNode: [], triples: [] }
) {
  const { store, formGraph, sourceGraph } = options;
  const shapeElements = store.match(shapeUri, undefined, undefined, formGraph);

  let nextSubject = new NamedNode(
    helpGenerateUri(shapeElements, { store, formGraph })
  );

  dataset.sourceNode = sourceNode || nextSubject;

  for (const shapeElement of shapeElements) {
    if (shapeElement.object.termType == "BlankNode") {
      const nextSourceNodes = store.match(
        sourceNode,
        shapeElement.predicate,
        undefined,
        sourceGraph
      );
      // for all triples matching this step in the path, reuse the object uri as source node
      // and continue generating from there
      if (nextSourceNodes.length > 0) {
        nextSourceNodes.forEach((nextSourceNode) => {
          const nestedDataset = walkAndGenerateShapeLazy(
            shapeElement.object,
            options,
            nextSourceNode.object
          );
          dataset.triples.push(
            new Statement(
              dataset.sourceNode,
              shapeElement.predicate,
              nestedDataset.sourceNode
            )
          );
          dataset.triples = [...dataset.triples, ...nestedDataset.triples];
        });
      } else {
        // here there are no triples matching the path yet. We need to create new instances for them.
        // so we don't pass in a sourceNode so a new one will be generated for us
        const nestedDataset = walkAndGenerateShapeLazy(
          shapeElement.object,
          options
        );

        dataset.triples.push(
          new Statement(
            dataset.sourceNode,
            shapeElement.predicate,
            nestedDataset.sourceNode
          )
        );

        dataset.triples = [...dataset.triples, ...nestedDataset.triples];
      }
    } else {
      // not a blank node but rather a direct predicate and object value. Easy: just add to the source node
      dataset.triples.push(
        new Statement(
          dataset.sourceNode,
          shapeElement.predicate,
          shapeElement.object
        )
      );
    }
  }
  return dataset;
}
