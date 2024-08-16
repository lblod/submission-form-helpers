import { NamedNode, Statement } from "rdflib";
import { v4 as uuidv4 } from "uuid";
import { SHACL } from "../namespaces.js";
import { URI_TEMPLATE } from "../constants.js";

export function triplesForUnscopedPath(
  options,
  pathInfo,
  createMissingNodes = false
) {
  const { path } = options;

  if (path && path.termType === "Collection") {
    return triplesForComplexPath(options, pathInfo, createMissingNodes);
  } else if (isCollection(path, options.store)) {
    // collections are only created as a proper term type if the ttl contains a collection like (a rdf:List). If it uses blank nodes, it will not be recognized so we need to create it ourselves
    const convertedOptions = {
      ...options,
      path: pathStartToCollection(path, options.store),
    };
    return triplesForComplexPath(
      convertedOptions,
      pathInfo,
      createMissingNodes
    );
  } else {
    return triplesForSimplePath(options, pathInfo, createMissingNodes);
  }
}

function isCollection(path, store) {
  return (
    path &&
    store.any(
      path,
      new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first"),
      undefined
    )
  );
}

function pathStartToCollection(path, store) {
  const elements = [];
  let currentElement = path;

  while (currentElement) {
    const first = store.any(
      currentElement,
      new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#first"),
      undefined
    );
    const rest = store.any(
      currentElement,
      new NamedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#rest"),
      undefined
    );

    elements.push(first);

    currentElement = rest;
  }

  return {
    termType: "Collection",
    elements: flattenCollection(elements, store),
  };
}

function flattenCollection(elements, store) {
  const result = [];
  elements.forEach((element) => {
    if (isCollection(element, store)) {
      const nestedList = pathStartToCollection(element, store);
      result.push(...nestedList.elements);
    } else {
      result.push(element);
    }
  });
  return result.filter(Boolean);
}

function triplesForSimplePath(options, pathInfo, createMissingNodes = false) {
  const { store, path, sourceGraph } = options;
  const { datasetTriples, startNodes } = pathInfo;
  let values = [];
  let triplesForPath = datasetTriples;

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

      triplesForPath = [...datasetTriples, ...triples];
    }
  }

  return {
    triples: triplesForPath,
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

function triplesForComplexPath(options, pathInfo, createMissingNodes = false) {
  const { store, path, formGraph, sourceGraph } = options;
  const { datasetTriples, startNodes } = pathInfo;

  // Convert PATH list to comprehensible objects
  const pathElements = path.elements.map((element) => {
    if (element.termType == "NamedNode") {
      return { path: element };
    } else {
      // WARNING: if not a named node, it must be a blank node (in this case). so using else here means
      // that we assume that the only operation allowed on a path node is an inverse operation
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
  let startingPoints = startNodes;
  const orderedSegmentData = [];

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

  // (this is redundant, if there are no startingPoints values will
  // always be an array, but it's more obvious ;-)
  if (nextPathElements.length == 0)
    return {
      triples: datasetTriples,
      values: startingPoints,
      orderedSegmentData,
    };
  else return { triples: datasetTriples, values: [], orderedSegmentData };
}
