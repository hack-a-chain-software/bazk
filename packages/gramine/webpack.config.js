const path = require('path');

module.exports = {
  entry: './src/index',
  mode: 'development',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './bazk-build/payload'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  target: 'node',
};

