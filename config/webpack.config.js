const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const ROOT_PATH = path.join(__dirname, '..')

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development'

  return {
    context: ROOT_PATH,
    entry: {
      background: path.join(ROOT_PATH, 'src', 'background.js'),
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
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          'manifest.json',
          'icons/*',
          'assets/*',
        ],
      }),
      new HtmlWebpackPlugin({
        filename: path.join('src', 'popup.html'),
        template: path.join(ROOT_PATH, 'src', 'popup', 'index.template.html'),
        chunks: ['popup'],
      }),
      new VueLoaderPlugin(),
    ],
    devtool: isDevelopment ? 'inline-source-map' : undefined,
  }
}