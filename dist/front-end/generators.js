"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generatorsForNode = generatorsForNode;
exports.triplesForGenerator = triplesForGenerator;

var _uuid = require("uuid");

var _namespaces = require("./namespaces");

var _rdflibShim = _interopRequireDefault(require("./rdflib-shim.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_URI_TEMPLATE = 'http://data.lblod.info/form-data/nodes/';

function generatorsForNode(node, options) {
  const {
    store,
    formGraph
  } = options;
  const createGenerators = store.match(node, (0, _namespaces.FORM)("createGenerator"), undefined, formGraph).map(t => t.object);
  const initGenerators = store.match(node, (0, _namespaces.FORM)("initGenerator"), undefined, formGraph).map(t => t.object);
  const augmentGenerators = store.match(node, (0, _namespaces.FORM)("augmentGenerator"), undefined, formGraph).map(t => t.object);
  return {
    createGenerators,
    initGenerators,
    augmentGenerators
  };
}

function triplesForGenerator(generatorUri, options) {
  const {
    store,
    formGraph
  } = options;
  const prototypeUri = store.any(generatorUri, (0, _namespaces.FORM)('prototype'), undefined, formGraph);
  const shapeUri = store.any(prototypeUri, (0, _namespaces.FORM)('shape'), undefined, formGraph);
  let dataset = walkAndGenerateShape(shapeUri, options); //TODO: currently just one source node is generated. Support cardinalities later

  dataset = {
    sourceNodes: [dataset.sourceNode],
    triples: dataset.triples
  };
  dataset = augmentGeneratedDataSet(generatorUri, dataset, {
    store,
    formGraph
  });
  return dataset;
}

function walkAndGenerateShape(shapeUri, options, dataset = {
  sourceNode: [],
  triples: []
}) {
  const {
    store,
    formGraph
  } = options;
  const shapeElements = store.match(shapeUri, undefined, undefined, formGraph);
  let nextSubject = new _rdflibShim.default.NamedNode(helpGenerateUri(shapeElements, {
    store,
    formGraph
  }));
  dataset.sourceNode = nextSubject;

  for (const shapeElement of shapeElements) {
    if (shapeElement.object.termType == "BlankNode") {
      const nestedDataset = walkAndGenerateShape(shapeElement.object, options);
      dataset.triples.push(new _rdflibShim.default.Statement(nextSubject, shapeElement.predicate, nestedDataset.sourceNode));
      dataset.triples = [...dataset.triples, ...nestedDataset.triples];
    } else {
      dataset.triples.push(new _rdflibShim.default.Statement(nextSubject, shapeElement.predicate, shapeElement.object));
    }
  }

  return dataset;
}

function augmentGeneratedDataSet(generatorUri, dataset, {
  store,
  formGraph
}) {
  const dataGenerators = store.match(generatorUri, (0, _namespaces.FORM)('dataGenerator'), undefined, formGraph);

  for (const generator of dataGenerators) {
    if (generator.object.equals((0, _namespaces.FORM)('addMuUuid'))) {
      const subjectValues = [...new Set(dataset.triples.map(triple => triple.subject.value))];
      const extraTriples = subjectValues.map(subjectV => {
        return new _rdflibShim.default.Statement(new _rdflibShim.default.NamedNode(subjectV), (0, _namespaces.MU)('uuid'), (0, _uuid.v4)());
      });
      dataset.triples = [...dataset.triples, ...extraTriples];
    } else {
      console.warn(`Unsupported 'form:dataGenerator' for ${generator.object.value}`);
    }
  }

  return dataset;
}

function helpGenerateUri(shapeElements, {
  store,
  formGraph
}) {
  const typeInformation = shapeElements.find(shape => shape.predicate.equals((0, _namespaces.RDF)('type')));

  if (typeInformation) {
    return newUriForType(typeInformation.object, {
      store,
      formGraph
    });
  } else {
    return DEFAULT_URI_TEMPLATE + (0, _uuid.v4)();
  }
}

function newUriForType(type, {
  store,
  formGraph
}) {
  const uriGenerator = uriGeneratorForType(type, {
    store,
    formGraph
  });
  const prefix = store.any(uriGenerator, (0, _namespaces.FORM)('prefix'), undefined, formGraph);

  if (uriGenerator && prefix) {
    return prefix.value + (0, _uuid.v4)();
  } else {
    return DEFAULT_URI_TEMPLATE + (0, _uuid.v4)();
  }
}

function uriGeneratorForType(type, {
  store,
  formGraph
}) {
  const uriGenerators = store.match(undefined, (0, _namespaces.RDF)('type'), (0, _namespaces.FORM)('UriGenerator'), formGraph);

  for (const generator of uriGenerators) {
    if (store.any(generator.subject, (0, _namespaces.FORM)('forType'), type, formGraph)) {
      return generator.subject;
    }
  }

  return null;
}