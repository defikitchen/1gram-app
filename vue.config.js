const Dotenv = require("dotenv-webpack");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  publicPath: "",
  pluginOptions: {
    cordovaPath: "src-cordova"
  },
  devServer: {
    disableHostCheck: true,
    overlay: {
      warnings: false,
      errors: false
    }
  },
  css: {
    loaderOptions: {
      sass: {
        implementation: require("sass")
      }
    }
  },
  lintOnSave: true,
  configureWebpack: {
    node: {
      __dirname: true
    },
    resolve: {
      alias: {
        "bn.js": "fork-bn.js" // otherwise web3 bundle size is hooooge
      }
    },
    mode: "development",
    plugins: [
      new Dotenv(),
      new CopyPlugin({
        patterns: [{ from: "./node_modules/ton-client-web-js/tonclient.wasm" }]
      })
    ]
  },
  chainWebpack: config => {
    config.module
      .rule("eslint")
      .use("eslint-loader")
      .options({
        fix: true,
        configFile: ".eslintrc.js",
        externals: [require("webpack-require-http")]
      });
  }
};
