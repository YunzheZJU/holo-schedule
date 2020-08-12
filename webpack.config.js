const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const ResolveEntryModulesPlugin = require('resolve-entry-modules-webpack-plugin')
const GenerateJsonFromJsPlugin = require('generate-json-from-js-webpack-plugin')
const webpack = require('webpack')
const PACKAGE = require('./package.json')

const ROOT_PATH = __dirname

module.exports = (env, argv) => {
  const isDevelopment = argv?.mode === 'development'
  const isChrome = Boolean(argv?.chrome)

  return {
    context: ROOT_PATH,
    entry: {
      background: path.join(ROOT_PATH, 'src', 'background', 'index.js'),
      popup: path.join(ROOT_PATH, 'src', 'popup', 'index.js'),
    },
    output: {
      filename: 'src/[name].js',
      path: path.join(ROOT_PATH, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.less$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'less-loader',
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.json5$/i,
          loader: 'json5-loader',
          type: 'javascript/auto',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      modules: [path.join(ROOT_PATH, 'src'), 'node_modules'],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'src/icons', to: 'icons' },
          { from: 'src/assets', to: 'assets' },
          { from: 'src/_locales', to: '_locales' },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: path.join('src', 'popup.html'),
        template: path.join(ROOT_PATH, 'src', 'popup', 'index.template.html'),
        chunks: ['popup'],
      }),
      new VueLoaderPlugin(),
      new ResolveEntryModulesPlugin(),
      new GenerateJsonFromJsPlugin({
        path: './src/manifest.js',
        filename: 'manifest.json',
        data: { isChrome, PACKAGE },
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(PACKAGE.version),
      }),
    ],
    devtool: isDevelopment ? 'inline-source-map' : undefined,
  }
}
