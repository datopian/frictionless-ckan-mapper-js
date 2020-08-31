const path = require('path')
const assetPath = './lib'

const createConfig = (target) => {
  return {
    mode: 'production',
    devtool: 'source-map',
    context: path.resolve(__dirname),
    entry: {
      index: `${assetPath}/index.js`,
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `frictionless-ckan-mapper.${target}.js`,
      libraryTarget: target,
      library: 'frictionlessCkanMapper',
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    module: {
      rules: [
        {
          use: {
            loader: 'babel-loader',
            options: { presets: ['@babel/preset-env'] },
          },
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
        },
      ],
    },
    node: { fs: 'empty' },
  }
}

module.exports = [
  createConfig('var'),
  createConfig('commonjs2'),
  createConfig('amd'),
  createConfig('umd'),
]
