const path = require('path')

module.exports = {
  settings: {
    'import/resolver': {
      node: {
        paths: [__dirname, path.join(__dirname, '..')],
        extensions: [
          '.js',
          '.json',
          '.vue',
        ],
      },
    },
  },
}
