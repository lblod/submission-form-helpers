import { Statement } from "rdflib";
import { FORM, RDF } from "./namespaces.js";
import { triplesForPath } from "./triples-for/triples-for-path.js";
import { URI_TEMPLATE } from "./constants.js";

export function addSimpleFormValue(value, options) {
  const { store } = options;

  //This returns the complete chain of triples for the path, if there something missing, new nodes are added.
  const dataset = triplesForPath(options, true);

  let triplesToAdd = [];
  // The reason why it is more complicated. If we encounter > 1 values for a path, the I expect this form
  // to be broken. This is a way for ther user to correct and remove both values.
  if (dataset.values.length > 0) {
    triplesToAdd = dataset.triples.filter(
      (t) => !dataset.values.find((v) => t.object.equals(v))
    );
  }

  if (value) {
    const newTriple = dataset.triples.slice(-1)[0];
    newTriple.object = value;
    triplesToAdd.push(newTriple);
  }

  // Add missing FormDataNode types for subjects without (rdf:type form:FormDataNode)
  const triplesToAddLength = triplesToAdd.length;

  for (let index = 0; index < triplesToAddLength; index++) {
    if (URI_TEMPLATE != "http://data.lblod.info/form-data/nodes/") {
      console.warn(
        `It seems the URI_TEMPLATE variable in the submission-form-helpers library has changed but the code responsible for
        ADDING (rdf:type form:FormDataNode) has not. This can cause unexpected behaviour. ADDING (rdf:type form:FormDataNode) has been disabled until manually resolved. 
        `
      );
      break;
    }

    const triple = triplesToAdd[index];

    if (triple.subject?.value?.startsWith(URI_TEMPLATE)) {
      triplesToAdd.push(
        new Statement(
          triple.subject,
          RDF("type"),
          FORM("FormDataNode"),
          triple.graph
        )
      );
    }
  }

  store.addAll(triplesToAdd);
}
