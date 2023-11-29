import { SHACL } from "./namespaces.js";
import { fieldsForForm } from "./fields-for-form.js";
import { getScope } from "./get-scope.js";
import { triplesForPath } from "./triples-for/triples-for-path.js";
import { triplesForScope } from "./triples-for/triples-for-scope.js";

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
