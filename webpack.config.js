const path = require("path");
const entryFile = path.resolve(__dirname, "client", "src", "index.tsx");
const outputDir = path.resolve(__dirname, "client", "public");

const webpack = require("webpack");

module.exports = {
  entry: entryFile,
  output: {
    publicPath: "/",
    filename: "bundle.js",
    path: outputDir,
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: "./client/public",
    hot: true,
    proxy: {
      "/api": "http://localhost:3000",
      "/auth": "http://localhost:3000",
      "/logout": "http://localhost:3000",
      "/profile": "http://localhost:3000",
      "/spending": "http://localhost:3000",
      "/home": "http://localhost:3000",
    },
  },
};
