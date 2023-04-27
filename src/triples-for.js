import { NamedNode, Statement } from "rdflib";
import { v4 as uuidv4 } from "uuid";
import { FORM, RDF, SHACL } from "./namespaces.js";

const URI_TEMPLATE = "http://data.lblod.info/form-data/nodes/";

export function triplesForPath(options, createMissingNodes = false) {
  const { path } = options;

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
  let startNodes = [sourceNode];
  if (scope) {
    //TODO: what if none?
    const scopedDataSet = triplesForScope(scope, {
      store,
      formGraph,
      sourceNode,
      sourceGraph,
    });
    startNodes = scopedDataSet.values;
    datasetTriples = [...datasetTriples, ...scopedDataSet.triples];
  }

  //TODO: why if no path? -> this should be an error-state
  if (path) {
    for (const sourceNode of startNodes) {
      const triples = store.match(sourceNode, path, undefined, sourceGraph);

      if (createMissingNodes && triples.length == 0) {
        triples.push(
          new Statement(
            sourceNode,
            path,
            new NamedNode(URI_TEMPLATE + uuidv4()),
            sourceGraph
          )
        );
      }

      values = [...values, ...triples.map(({ object }) => object)];

      datasetTriples = [...datasetTriples, ...triples];
    }
  }

  return {
    triples: datasetTriples,
    values,
    orderedSegmentData: [
      {
        pathElement: { path },
        triples: datasetTriples,
        values,
      },
    ],
  };
}

function triplesForComplexPath(options, createMissingNodes = false) {
  const { store, path, formGraph, sourceNode, sourceGraph, scope } = options;
  let datasetTriples = [];

  // Convert PATH list to comprehensible objects
  const pathElements = path.elements.map((element) => {
    if (element.termType == "NamedNode") {
      return { path: element };
    } else {
      const elementInfo = store.any(
        element,
        SHACL("inversePath"),
        undefined,
        formGraph
      );
      return { inversePath: elementInfo };
    }
  });

  // Walk over each part of the path list
  let startingPoints = [sourceNode];
  const orderedSegmentData = [];

  if (scope) {
    //TODO: what if none?
    const scopedDataSet = triplesForScope(scope, {
      store,
      formGraph,
      sourceNode,
      sourceGraph,
    });
    startingPoints = scopedDataSet.values;
    datasetTriples = [...datasetTriples, ...scopedDataSet.triples];
  }

  let nextPathElements = pathElements;
  while (nextPathElements.length) {
    // walk one segment of the path list
    let [currentPathElement, ...restPathElements] = nextPathElements;

    const segmentData = {
      pathElement: currentPathElement,
      triples: [],
      values: [],
    };

    for (let startingPoint of startingPoints) {
      if (currentPathElement.inversePath) {
        // inverse path, walk in other direction
        const triples = store.match(
          undefined,
          currentPathElement.inversePath,
          startingPoint,
          sourceGraph
        );

        if (createMissingNodes && triples.length == 0) {
          triples.push(
            new Statement(
              new NamedNode(URI_TEMPLATE + uuidv4()),
              currentPathElement.inversePath,
              startingPoint,
              sourceGraph
            )
          );
        }

        triples.map((triple) => {
          datasetTriples.push(triple);
          segmentData.triples.push(triple);
          segmentData.values.push(triple.subject);
        });
      } else {
        // regular path, walk in normal direction
        const triples = store.match(
          startingPoint,
          currentPathElement.path,
          undefined,
          sourceGraph
        );

        if (createMissingNodes && triples.length == 0) {
          triples.push(
            new Statement(
              startingPoint,
              currentPathElement.path,
              new NamedNode(URI_TEMPLATE + uuidv4()),
              sourceGraph
            )
          );
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
    return {
      triples: datasetTriples,
      values: startingPoints,
      orderedSegmentData,
    };
  else return { triples: datasetTriples, values: [], orderedSegmentData };
}

//Note: scope can match multiple nodes
export function triplesForScope(scopeUri, options) {
  const { store, formGraph, sourceNode, sourceGraph } = options;
  let path = store.any(scopeUri, SHACL("path"), undefined, formGraph);
  const dataset = triplesForPath({
    store,
    path,
    formGraph,
    sourceNode,
    sourceGraph,
  });

  //TODO: probably this could be more performant
  //TODO: support other types of constraints?
  let constraints = store
    .match(scopeUri, FORM("constraint"), undefined, formGraph)
    .filter((constraint) =>
      store.any(constraint.object, RDF("type"), SHACL("NodeShape"), formGraph)
    )
    .map((constraint) =>
      store.match(constraint.object, SHACL("property"), undefined, formGraph)
    )
    .reduce((acc, properties) => {
      return [...acc, ...properties];
    }, [])
    .map((property) => {
      return {
        path: store.any(property.object, SHACL("path"), undefined, formGraph),
        targetNode: store.any(
          property.object,
          SHACL("targetNode"),
          undefined,
          formGraph
        ),
      };
    });

  // filter out values which don't match shapes
  // Note: the filtered data changes  are applied in place
  const orderedSegmentData = dataset.orderedSegmentData;
  const lastSegmentData = orderedSegmentData.slice(-1)[0];

  for (const value of [...lastSegmentData.values]) {
    for (const constraint of constraints) {
      const objects = triplesForPath({
        store,
        path: constraint.path,
        formGraph,
        sourceNode: value,
        sourceGraph,
      }).values;

      if (!objects.find((o) => o.equals(constraint.targetNode))) {
        lastSegmentData.values = lastSegmentData.values.filter(
          (v) => !v.equals(value)
        );

        if (lastSegmentData.pathElement.inversePath) {
          lastSegmentData.triples = lastSegmentData.triples.filter(
            (t) => !t.subject.equals(value)
          );
        } else {
          lastSegmentData.triples = lastSegmentData.triples.filter(
            (t) => !t.object.equals(value)
          );
        }
      }
    }
  }

  const filteredTriples = orderedSegmentData.reduce((acc, segment) => {
    return [...acc, ...segment.triples];
  }, []);

  return {
    triples: filteredTriples,
    values: lastSegmentData.values,
    orderedSegmentData,
  };
}
