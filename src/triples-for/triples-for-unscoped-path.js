import { NamedNode, Statement } from "rdflib";
import { v4 as uuidv4 } from "uuid";
import { SHACL, RDF, FORM } from "../namespaces.js";
import { URI_TEMPLATE } from "../constants.js";

export function triplesForUnscopedPath(
  options,
  pathInfo,
  createMissingNodes = false
) {
  const { path } = options;

  // TODO: how would we deal with?
  // path [ sh:inversePath ext:theInversePredicate ];
  // (and which should be equivalent and which isn't)
  // ( [ sh:inversePath ext:theInversePredicate ] )
  if (path && path.termType === "Collection") {
    return triplesForComplexPath(options, pathInfo, createMissingNodes);
  } else {
    return triplesForSimplePath(options, pathInfo, createMissingNodes);
  }
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

      // This is very obfuscated way of creating a
      // stub-triple so consumers (i.e. components)
      // can work with the created triple
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
          const newSubject = new NamedNode(URI_TEMPLATE + uuidv4());

          // This is very obfuscated way of creating a
          // stub-triple so consumers (i.e. components)
          // can work with the created triple
          triples.push(
            new Statement(
              newSubject,
              currentPathElement.inversePath,
              startingPoint,
              sourceGraph
            )
          );

          // If hops are created, we give them here a rdf:type
          // Most systems really like types.
          // Why the penultimate pathElement?
          // Because we only care about intermediate hops
          // and their types.
          // The last pathElement will match the triple
          // the component works on and should
          // be managed by this.
          // TODO: what's bothering me
          //  - it's added immediatly to the store, contradicting the other behaviour
          //  - maybe the general problem of dangling triples
          if(nextPathElements.length > 1) {
            store.addAll([
             new Statement(
               newSubject,
               RDF('type'),
               FORM('FormDataNode'),
               sourceGraph
             )
            ]);
          }
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

          // This is very obfuscated way of creating a
          // stub-triple so consumers (i.e. components)
          // can work with the created triple
          const newSubject = new NamedNode(URI_TEMPLATE + uuidv4());
          triples.push(
            new Statement(
              startingPoint,
              currentPathElement.path,
              newSubject,
              sourceGraph
            )
          );

          // If hops are created, we give them here a rdf:type
          // Most systems really like types.
          // Why the penultimate pathElement?
          // Because we only care about intermediate hops
          // and their types.
          // The last pathElement will match the triple
          // the component works on and should
          // be managed by this.
          if(nextPathElements.length > 1) {
            store.addAll([
             new Statement(
               newSubject,
               RDF('type'),
               FORM('FormDataNode'),
               sourceGraph
             )
            ]);
          }
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
