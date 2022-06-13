module.exports = {
  extends: ['plugin:vue/recommended', 'prettier'],
  overrides: [{ files: '*.vue' }],
  rules: {
    'vue/no-v-html': 'off',

    'vue/component-definition-name-casing': 'error',
    'vue/component-name-in-template-casing': 'error',
    'vue/no-deprecated-scope-attribute': 'error',
    'vue/no-deprecated-slot-attribute': 'error',
    'vue/no-deprecated-slot-scope-attribute': 'error',
    'vue/padding-line-between-blocks': 'error',
    'vue/require-name-property': 'error',
    'vue/v-slot-style': 'error',
    'vue/valid-v-bind-sync': 'error',
    'vue/valid-v-slot': 'error',
  },
}
