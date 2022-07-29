module.exports = function(api){
  api.cache(true);
  return {
    "presets": [
      ["@babel/preset-env",{
        "targets": {
          "node": 14
        }
      }]
    ],
    "plugins": [
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      ["@babel/plugin-proposal-class-properties", { "loose" : true }],
      ["module-extension", { js: "cjs" }] // The built files need to use the .cjs extension to import other relative files
    ]
  }
}
  