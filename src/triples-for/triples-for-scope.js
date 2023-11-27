import { FORM, RDF, SHACL } from "../namespaces.js";
import { triplesForUnscopedPath } from "./triples-for-unscoped-path.js";

function toPathConstraints(rawConstraints, scopeOptions, negative = false) {
  const { store, formGraph } = scopeOptions;
  return rawConstraints
    .map((constraint) => {
      return store.match(
        constraint.object,
        SHACL("property"),
        undefined,
        formGraph
      );
    })
    .reduce((acc, properties) => {
      return [...acc, ...properties];
    }, [])
    .map((property) => {
      return {
        path: store.any(property.object, SHACL("path"), undefined, formGraph),
        negative,
        targetNode: store.any(
          property.object,
          SHACL("targetNode"),
          undefined,
          formGraph
        ),
      };
    });
}

function getNodeShapeConstraints(constraints, scopeOptions) {
  const { store, formGraph } = scopeOptions;
  return toPathConstraints(
    constraints.filter((constraint) =>
      store.any(constraint.object, RDF("type"), SHACL("NodeShape"), formGraph)
    ),
    scopeOptions,
    false
  );
}

function getNegativeNodeShapeConstraints(constraints, scopeOptions) {
  const { store, formGraph } = scopeOptions;
  return toPathConstraints(
    constraints.filter((constraint) =>
      store.any(
        constraint.object,
        RDF("type"),
        SHACL("NegativeNodeShape"),
        formGraph
      )
    ),
    scopeOptions,
    true
  );
}

function constraintMatches(constraint, value, scopeOptions) {
  const { store, formGraph, sourceGraph } = scopeOptions;
  const objects = triplesForUnscopedPath(
    {
      store,
      path: constraint.path,
      formGraph,
      sourceNode: value,
      sourceGraph,
    },
    { datasetTriples: [], startNodes: [value] }
  ).values;

  const matchFound = objects.find((o) => o.equals(constraint.targetNode));
  return constraint.negative ? !matchFound : matchFound;
}

function checkConstraintsOnLastPathSegment(
  constraints,
  scopeUri,
  scopeOptions
) {
  const { store, formGraph, sourceNode, sourceGraph } = scopeOptions;
  let path = store.any(scopeUri, SHACL("path"), undefined, formGraph);

  const triplesMatchingPath = triplesForUnscopedPath(
    {
      store,
      path,
      formGraph,
      sourceNode,
      sourceGraph,
    },
    { datasetTriples: [], startNodes: [sourceNode] }
  );

  // filter out values which don't match shapes
  // Note: the filtered data changes  are applied in place
  const orderedSegmentData = triplesMatchingPath.orderedSegmentData;
  const lastSegmentData = orderedSegmentData.slice(-1)[0];

  for (const value of [...lastSegmentData.values]) {
    for (const constraint of constraints) {
      const match = constraintMatches(constraint, value, scopeOptions);

      if (!match) {
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

  return { orderedSegmentData, lastSegmentData };
}

//Note: scope can match multiple nodes
export function triplesForScope(scopeUri, scopeOptions) {
  const { store, formGraph } = scopeOptions;

  //TODO: probably this could be more performant
  const allConstraints = store.match(
    scopeUri,
    FORM("constraint"),
    undefined,
    formGraph
  );

  const nodeShapeConstraints = getNodeShapeConstraints(
    allConstraints,
    scopeOptions
  );
  const negativeNodeShapeConstraints = getNegativeNodeShapeConstraints(
    allConstraints,
    scopeOptions
  );
  //TODO: support other types of constraints?
  const constraints = [
    ...nodeShapeConstraints,
    ...negativeNodeShapeConstraints,
  ];

  const { orderedSegmentData, lastSegmentData } =
    checkConstraintsOnLastPathSegment(constraints, scopeUri, scopeOptions);

  const filteredTriples = orderedSegmentData.reduce((acc, segment) => {
    return [...acc, ...segment.triples];
  }, []);

  return {
    triples: filteredTriples,
    values: lastSegmentData.values,
    orderedSegmentData,
  };
}
