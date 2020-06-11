const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

const ROOT_PATH = path.join(__dirname, '..')

module.exports = {
  context: ROOT_PATH,
  entry: {
    background: path.join(ROOT_PATH, 'src', 'background.js'),
  },
  output: {
    filename: 'src/[name].js',
    path: path.join(ROOT_PATH, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        'manifest.json',
        'icons/*',
      ],
    }),
  ],
  devtool: 'inline-source-map',
}