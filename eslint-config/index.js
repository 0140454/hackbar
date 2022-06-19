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
    camelcase: 'off',
    'import/no-cycle': 'error',
    'import/order': ['error', { alphabetize: { order: 'asc' } }],
    'no-console': 'error',
    'no-debugger': 'error',
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'prefer-const': ['error', { destructuring: 'all' }],
    'prettier/prettier': 'error',
    'require-sort/require-sort': ['error', { ignoreDeclarationSort: true }],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'standard/no-callback-literal': 'off',
  },
}
