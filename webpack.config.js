const { readFileSync } = require('fs')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const ResolveEntryModulesPlugin = require('resolve-entry-modules-webpack-plugin')
const GenerateJsonFromJsPlugin = require('generate-json-from-js-webpack-plugin')
const WebExtension = require('webpack-target-webextension')
const webpack = require('webpack')
const { compact } = require('lodash')
const PACKAGE = require('./package.json')

const ROOT_PATH = __dirname

module.exports = (env, argv) => {
  const isDevelopment = argv?.mode === 'development'
  const isChrome = Boolean(env?.chrome)

  return {
    context: ROOT_PATH,
    mode: isDevelopment ? 'development' : 'production',
    entry: {
      background: path.join(ROOT_PATH, 'src', 'background', 'index.js'),
      popup: path.join(ROOT_PATH, 'src', 'popup', 'index.js'),
      options: path.join(ROOT_PATH, 'src', 'options', 'index.js'),
    },
    stats: {
      errorDetails: true,
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
          include: path.resolve(__dirname, 'src/background/i18n/locales'),
        },
        {
          test: /\.json5$/i,
          loader: '@intlify/vue-i18n-loader',
          type: 'javascript/auto',
          exclude: path.resolve(__dirname, 'src/background/i18n/locales'),
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      modules: [path.join(ROOT_PATH, 'src'), 'node_modules'],
      alias: {
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
      },
    },
    plugins: compact([
      new CopyPlugin({
        patterns: [
          { from: 'src/icons', to: 'icons' },
          { from: 'src/assets', to: 'assets' },
          { from: 'src/_locales', to: '_locales' },
        ],
      }),
      isChrome ? undefined : new HtmlWebpackPlugin({
        filename: path.join('src', 'background.html'),
        templateContent: readFileSync(path.join(ROOT_PATH, 'src', 'background', 'index.template.html'), 'utf8'),
        chunks: ['background'],
      }),
      new HtmlWebpackPlugin({
        filename: path.join('src', 'popup.html'),
        templateContent: readFileSync(path.join(ROOT_PATH, 'src', 'popup', 'index.template.html'), 'utf8'),
        chunks: ['popup'],
      }),
      new HtmlWebpackPlugin({
        filename: path.join('src', 'options.html'),
        templateContent: readFileSync(path.join(ROOT_PATH, 'src', 'options', 'index.template.html'), 'utf8'),
        chunks: ['options'],
      }),
      new VueLoaderPlugin(),
      new ResolveEntryModulesPlugin(),
      new GenerateJsonFromJsPlugin({
        path: './src/manifest.js',
        filename: 'manifest.json',
        data: { isChrome, PACKAGE },
      }),
      isChrome && new WebExtension({
        background: {
          entry: 'background',
          manifest: 3,
        },
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(PACKAGE.version),
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_I18N_FULL_INSTALL__: true,
        __VUE_I18N_LEGACY_API__: true,
        __VUE_I18N_PROD_DEVTOOLS__: false,
        __INTLIFY_PROD_DEVTOOLS__: false,
      }),
    ]),
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2,
          },
        },
      },
    },
    devtool: isDevelopment ? 'inline-source-map' : undefined,
  }
}
