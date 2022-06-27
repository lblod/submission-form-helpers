import { Namespace } from "rdflib";

const RDF = new Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const FORM = new Namespace("http://lblod.data.gift/vocabularies/forms/");
const SHACL = new Namespace("http://www.w3.org/ns/shacl#");
const SKOS = new Namespace("http://www.w3.org/2004/02/skos/core#");
const XSD = new Namespace("http://www.w3.org/2001/XMLSchema#");
const DCT = new Namespace("http://purl.org/dc/terms/");
const NIE = new Namespace("http://www.semanticdesktop.org/ontologies/2007/01/19/nie#");

export { RDF, FORM, SHACL, SKOS, XSD, DCT, NIE };
