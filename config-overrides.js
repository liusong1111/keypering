const { override, babelInclude, addBabelPlugin, addLessLoader } = require("customize-cra");
const path = require("path");

module.exports = override(
  babelInclude([path.resolve("src"), path.resolve("node_modules/idb")]),
  // babelInclude([path.resolve("src")]),
  addBabelPlugin("transform-object-rest-spread"),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
    }
  })
);
