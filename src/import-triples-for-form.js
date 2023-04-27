import { FORM, SHACL } from "./namespaces.js";
import { fieldsForForm } from "./fields-for-form.js";
import { triplesForPath, triplesForScope } from "./triples-for.js";

export default function importTriplesForForm(
  form,
  { store, formGraph, sourceGraph, sourceNode, metaGraph }
) {
  let datasetTriples = [];
  for (let field of fieldsForForm(form, {
    store,
    formGraph,
    sourceGraph,
    sourceNode,
    metaGraph,
  })) {
    let scopedSourceNodes = [sourceNode];
    const scope = getScope(field, { store, formGraph });
    if (scope) {
      const scopedDataSet = triplesForScope(scope, {
        store,
        formGraph,
        sourceNode,
        sourceGraph,
      });
      scopedSourceNodes = scopedDataSet.values;
    }

    for (const sourceNode of scopedSourceNodes) {
      let path = store.any(field, SHACL("path"), undefined, formGraph);
      triplesForPath({
        path,
        store,
        formGraph,
        sourceNode,
        sourceGraph,
      }).triples.forEach((item) => datasetTriples.push(item));
    }
  }

  return datasetTriples;
}
export { importTriplesForForm };

function getScope(field, options) {
  const { store, formGraph } = options;
  const scope = store.any(field, FORM("scope"), undefined, formGraph);
  return scope;
}
