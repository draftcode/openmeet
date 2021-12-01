const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {background: './src/background/index.ts'},
  module: {
    rules: [{test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/}],
  },
  resolve: {
    extensions: ['.tsx', '.ts', 'js'],
  },
  plugins: [
    new CleanWebpackPlugin({cleanStaleWebpackAssets: false}),
    new CopyWebpackPlugin({
      patterns: [
        {from: './public/manifest.json'},
        {from: './public/icon.png'},
      ],
    }),
  ],
  output: {filename: '[name].js', path: path.resolve(__dirname, 'dist')},
};
