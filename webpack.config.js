const path = require('path')
const assetPath = './lib'

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  context: path.resolve(__dirname),
  entry: {
    index: `${assetPath}/index.js`,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'var',
    library: 'frictionlessCkanMapper', // The variable name to access the library
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
      },
    ],
  },
  node: { fs: 'empty' },
}
