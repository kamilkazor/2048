const commonConfig = require("./webpack.common.js");
const {merge} = require("webpack-merge");

const config = {
  mode: "production"
};

module.exports = merge(commonConfig, config);