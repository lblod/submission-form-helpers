import test from "ava";
import { NamedNode } from "rdflib";
import ForkingStore from "forking-store";
import { readFileSync } from "node:fs";
import { RDF, FORM, fieldsForForm } from "../src/index.js";

const FORM_GRAPHS = {
  formGraph: new NamedNode("http://data.lblod.info/form"),
  metaGraph: new NamedNode("http://data.lblod.info/metagraph"),
  sourceGraph: new NamedNode(`http://data.lblod.info/sourcegraph`),
};

const SOURCE_NODE = new NamedNode(
  "http://ember-submission-form-fields/source-node"
);

function readFixtureFile(filePath) {
  return readFileSync(
    new URL(`fixtures/${filePath}`, import.meta.url),
    "utf-8"
  );
}

test("it returns the conditional fields only if the condition is fulfilled (old model)", (t) => {
  const formTtl = readFixtureFile("conditionals-v1/form.ttl");
  const metaTtl = readFixtureFile("conditionals-v1/meta.ttl");

  let store = new ForkingStore();
  store.parse(formTtl, FORM_GRAPHS.formGraph, "text/turtle");
  store.parse(metaTtl, FORM_GRAPHS.metaGraph, "text/turtle");

  const form = store.any(
    undefined,
    RDF("type"),
    FORM("Form"),
    FORM_GRAPHS.formGraph
  );

  let sourceTtl = readFixtureFile("conditionals-v1/source.ttl");
  store.parse(sourceTtl, FORM_GRAPHS.sourceGraph, "text/turtle");

  const fields = fieldsForForm(form, {
    store,
    sourceNode: SOURCE_NODE,
    ...FORM_GRAPHS,
  });

  t.snapshot(fields);
});
