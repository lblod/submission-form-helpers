import { triplesForUnscopedPath } from "./triples-for-unscoped-path.js";
import { triplesForScope } from "./triples-for-scope.js";

export function triplesForPath(options, createMissingNodes = false) {
  const { store, formGraph, sourceNode, sourceGraph, scope } = options;
  let datasetTriples = [];
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

  return triplesForUnscopedPath(
    options,
    { startNodes, datasetTriples },
    createMissingNodes
  );
}
