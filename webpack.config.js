const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

const devMode = process.env.NODE_ENV !== 'production'

const jsLoaders = preset => {
  const loaders = [{
    loader: "babel-loader",
    options: {
      presets: ['@babel/preset-env'], 
      plugins: ['@babel/plugin-proposal-class-properties']
    }
  }]

  if (devMode) {
    loaders.push('eslint-loader')
  }

  if (preset) {
    loaders[0].options.presets.push(preset)
  }

  return loaders
}

module.exports = {
  mode: devMode ? 'development' : 'production',
  entry: {
    index: ['@babel/polyfill', './src/scripts/index.js']
  },
  output: {
    filename: devMode ? '[name].bundle.js' : '[name][contenthash].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.json', '.ts'],
    alias: {
      '@modules': path.resolve(__dirname, 'src/scripts/modules'),
      '@': path.resolve(__dirname, 'src'),
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  devtool: devMode ? 'inline-source-map' : false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: jsLoaders('@babel/preset-typescript')
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      filename: '../index.html',
      publicPath: '/scripts',
      chunks: ['index'],
      template: './dist/index.html',
      inject: 'body'
    }),
  ],
}
