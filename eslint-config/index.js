module.exports = {
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  plugins: ['require-sort', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    camelcase: 'off',
    'standard/no-callback-literal': 'off',
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'import/order': ['error', { alphabetize: { order: 'asc' } }],
    'require-sort/require-sort': ['error', { ignoreDeclarationSort: true }],
    'prefer-const': ['error', { destructuring: 'all' }],
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'import/no-cycle': 'error',
  },
}
