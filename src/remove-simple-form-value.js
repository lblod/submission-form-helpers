import { Statement } from "rdflib";
import { FORM, RDF } from "./namespaces.js";
import { triplesForPath } from "./triples-for/triples-for-path.js";

export function removeSimpleFormValue(value, options) {
  const { store } = options;

  //This returns the complete chain of triples for the path, if there something missing, new nodes are added.
  const dataset = triplesForPath(options, true);

  let triplesToRemove = [];
  // The reason why it is more complicated. If we encounter > 1 values for a path, the I expect this form
  // to be broken. This is a way for ther user to correct and remove both values.
  if (dataset.values.length > 0) {
    triplesToRemove = dataset.triples.filter(
      (t) => !dataset.values.find((v) => t.object.equals(v))
    );
  }

  if (value) {
    const newTriple = dataset.triples.slice(-1)[0];
    newTriple.object = value;
    triplesToRemove.push(newTriple);
  }

  store.removeStatements(triplesToRemove);
}

export function removeDatasetForSimpleFormValue(value, options) {
  const { store } = options;

  //This returns the complete chain of triples for the path, if there something missing, new nodes are added.
  const dataset = triplesForPath(options, true);
  const triplesToRemove = dataset.triples.filter((t) => t.object.equals(value));

  // Remove dangling FormDataNode types (subjects with only rdf:type form:FormDataNode)
  const triplesToRemoveLength = triplesToRemove.length;

  for (let index = 0; index < triplesToRemoveLength; index++) {
    const triple = triplesToRemove[index];

    if (
      !triple.subject?.value?.startsWith(
        "http://data.lblod.info/form-data/nodes/"
      )
    )
      return;

    const attachedTriples = store.match(
      triple.subject,
      null,
      null,
      triple.graph
    );
    const currentTriplePlusRdfTypeTriple = 2;

    if (attachedTriples.length == currentTriplePlusRdfTypeTriple) {
      triplesToRemove.push(
        new Statement(
          triple.subject,
          RDF("type"),
          FORM("FormDataNode"),
          triple.graph
        )
      );
    }
  }

  store.removeStatements(triplesToRemove);
}
