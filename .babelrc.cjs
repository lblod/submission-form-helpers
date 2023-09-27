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
    plugins: ["./babel/cjs-extension"],
    ignore: ["**/*.test.js"],
  };
};
