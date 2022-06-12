const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const webpack = require("webpack");

module.exports = (env, { mode = "development" }) => {
  return {
    mode: "none",
    cache: {
      type: "filesystem",
    },
    entry: {
      app: ["./scripts/index.js"],
      devtools: ["./scripts/devtools.js"],
    },
    output: {
      clean: true,
      filename: "scripts/[name].js",
      assetModuleFilename: "assets/[name][ext]",
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: "vue-loader",
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.s(a|c)ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
              },
            },
          ],
        },
        {
          test: /\.(eot|woff|woff2)\??.*$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: "./css/[name].css",
      }),
      new HtmlWebpackPlugin({
        template: "index.html",
        filename: "index.html",
        chunks: ["app"],
      }),
      new HtmlWebpackPlugin({
        template: "devtools.html",
        filename: "devtools.html",
        chunks: ["devtools"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "images/icon.png", to: "images/icon.png" },
          { from: "manifest.json", to: "manifest.json" },
          { from: "payloads/paths.txt", to: "payloads/paths.txt" },
          { from: "scripts/background.js", to: "scripts/background.js" },
          { from: "scripts/lib/post.js", to: "scripts/lib/post.js" },
          { from: "scripts/test/*", to: "." },
        ],
      }),
    ],
  };
};
