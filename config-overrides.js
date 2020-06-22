const { override, babelInclude, addBabelPlugin } = require("customize-cra");
const path = require("path");

module.exports = override(
  babelInclude([path.resolve("src"), path.resolve("node_modules/idb")]),
  // babelInclude([path.resolve("src")]),
  addBabelPlugin("transform-object-rest-spread")
);
