module.exports = {
  setupFiles: [
    'jest-webextension-mock',
  ],
  moduleDirectories: [
    'background',
    'popup',
    'options',
    'src',
    'node_modules',
  ],
  transform: {
    '^.+\\.json5?$': 'json5-jest',
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  globals: {
    IS_CHROME: false,
  },
}
