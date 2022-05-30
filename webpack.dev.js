const commonConfig = require("./webpack.common.js");
const {merge} = require("webpack-merge");

const config = {
  mode: "development",
  devtool: "source-map"
};

module.exports = merge(commonConfig, config);