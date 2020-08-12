const path = require('path')

module.exports = {
  globals: {
    VERSION: 'readonly',
  },
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
