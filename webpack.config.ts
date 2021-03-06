import HtmlWebpackPlugin from "html-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import * as path from "path";
import { Configuration } from "webpack";

const config: Configuration = {
  entry: "./src/index.ts",
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist")
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.csv$/,
        use: "file-loader"
      }
    ]
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [new HtmlWebpackPlugin({ title: "The Echo of the World" })]
};

module.exports = config;
