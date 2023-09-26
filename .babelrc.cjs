module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: 14,
          },
        },
      ],
    ],
    plugins: [
      ["module-extension", { js: "cjs" }], // The built files need to use the .cjs extension to import other relative files
    ],
    ignore: ["**/*.test.js"],
  };
};
