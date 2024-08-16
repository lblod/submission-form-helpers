import test from "ava";
import { NamedNode } from "rdflib";
import ForkingStore from "forking-store";
import { readFixtureFile } from "./test-helpers.js";
import { triplesForPath } from "../src/triples-for/triples-for-path.js";
import { updateSimpleFormValue } from "../src/update-simple-form-value.js";

const FORM_GRAPHS = {
  formGraph: new NamedNode("http://data.lblod.info/form"),
  metaGraph: new NamedNode("http://data.lblod.info/metagraph"),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  "http://data.lblod.info/id/mandatarissen/66BF5DCD6AC916361F429AF2"
);

test("it returns the conditional fields only if the condition is fulfilled (old model)", (t) => {
  const formTtl = readFixtureFile("collection-paths/form.ttl");
  const sourceTtl = readFixtureFile("collection-paths/source.ttl");

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");

  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");

  const fractiePath = store.any(
    new NamedNode("http://mu.semte.ch/vocabularies/ext/fractieF"),
    new NamedNode("http://www.w3.org/ns/shacl#path"),
    undefined,
    FORM_GRAPHS.formGraph
  );

  const storeOptions = {
    store,
    path: fractiePath,
    formGraph: FORM_GRAPHS.formGraph,
    sourceNode: SOURCE_NODE,
    sourceGraph: FORM_GRAPHS.sourceGraph,
  };
  let result = triplesForPath(storeOptions);

  // reading works
  t.snapshot(result.values);

  // Cleanup old value(s) in the store
  const matches = triplesForPath(storeOptions, true).values;
  matches.forEach((m) => updateSimpleFormValue(storeOptions, undefined, m));

  updateSimpleFormValue(
    storeOptions,
    new NamedNode("http://mu.semte.ch/vocabularies/ext/myNewFraction")
  );

  result = triplesForPath(storeOptions);
  // updating works
  t.snapshot(result.values);
});
