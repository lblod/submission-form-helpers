/**
 * A simple babel plugin that replaces .js with .cjs for all relative imports.
 * We publish both ESM and CJS modules, but the CJS version requires .cjs extensions to work properly.
 */
export default function cjsExtensionPlugin() {
  return {
    visitor: {
      ImportDeclaration: maybeChangeExtension,
      ExportNamedDeclaration: maybeChangeExtension,
      ExportAllDeclaration: maybeChangeExtension,
    },
  };
}

function maybeChangeExtension(path) {
  if (hasImportSource(path)) {
    const source = path.node.source;

    if (isRelativeImport(source)) {
      toCjsExtension(source);
    }
  }
}

/**
 * Checks if the node has a source. Only re-exports have a source which we need to change.
 * @returns {boolean}
 */
function hasImportSource(path) {
  return Boolean(path.node.source);
}

function isRelativeImport(source) {
  return source.value.startsWith(".");
}

function toCjsExtension(source) {
  source.value = source.value.replace(".js", ".cjs");
}
