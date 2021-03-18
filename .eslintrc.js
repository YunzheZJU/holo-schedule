module.exports = {
  env: {
    browser: true,
    es2020: true,
    jest: true,
  },
  extends: [
    'plugin:vue/recommended',
    'airbnb-base',
    'plugin:@intlify/vue-i18n/recommended',
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  rules: {
    'arrow-parens': ['warn', 'as-needed'],
    'dot-notation': 'off',
    'no-console': 'off',
    semi: ['error', 'never'],
    'object-curly-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/script-indent': ['error', 2, { baseIndent: 1 }],
    'vue/max-attributes-per-line': ['error', {
      singleline: 10,
      multiline: {
        max: 1,
        allowFirstLine: true,
      },
    }],
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        indent: 'off',
      },
    },
  ],
  settings: {
    'vue-i18n': {
      // It should fail to parse json5
      localeDir: './path/to/locales/*.json5',
    },
  },
}
