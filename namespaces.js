import rdflib from "./rdflib-shim.js";

const RDF = new rdflib.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const FORM = new rdflib.Namespace("http://lblod.data.gift/vocabularies/forms/");
const SHACL = new rdflib.Namespace("http://www.w3.org/ns/shacl#");
const SKOS = new rdflib.Namespace("http://www.w3.org/2004/02/skos/core#");
const XSD = new rdflib.Namespace("http://www.w3.org/2001/XMLSchema#");
const DCT = new rdflib.Namespace("http://purl.org/dc/terms/");
const NIE = new rdflib.Namespace("http://www.semanticdesktop.org/ontologies/2007/01/19/nie#");
const MU = new rdflib.Namespace("http://mu.semte.ch/vocabularies/core/");

export { RDF, FORM, SHACL, SKOS, XSD, DCT, NIE, MU };
