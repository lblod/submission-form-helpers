"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.XSD = exports.SKOS = exports.SHACL = exports.RDF = exports.NIE = exports.MU = exports.FORM = exports.DCT = void 0;

var _rdflibShim = _interopRequireDefault(require("./rdflib-shim.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RDF = new _rdflibShim.default.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
exports.RDF = RDF;
const FORM = new _rdflibShim.default.Namespace("http://lblod.data.gift/vocabularies/forms/");
exports.FORM = FORM;
const SHACL = new _rdflibShim.default.Namespace("http://www.w3.org/ns/shacl#");
exports.SHACL = SHACL;
const SKOS = new _rdflibShim.default.Namespace("http://www.w3.org/2004/02/skos/core#");
exports.SKOS = SKOS;
const XSD = new _rdflibShim.default.Namespace("http://www.w3.org/2001/XMLSchema#");
exports.XSD = XSD;
const DCT = new _rdflibShim.default.Namespace("http://purl.org/dc/terms/");
exports.DCT = DCT;
const NIE = new _rdflibShim.default.Namespace("http://www.semanticdesktop.org/ontologies/2007/01/19/nie#");
exports.NIE = NIE;
const MU = new _rdflibShim.default.Namespace("http://mu.semte.ch/vocabularies/core/");
exports.MU = MU;