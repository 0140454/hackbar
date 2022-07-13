module.exports = {
  extends: ['plugin:vue/recommended', 'prettier'],
  overrides: [{ files: '*.vue' }],
  rules: {
    'vue/component-definition-name-casing': 'error',
    'vue/component-name-in-template-casing': 'error',
    'vue/component-tags-order': [
      'error',
      { order: ['template', 'script', 'style'] },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'any',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/no-deprecated-scope-attribute': 'error',
    'vue/no-deprecated-slot-attribute': 'error',
    'vue/no-deprecated-slot-scope-attribute': 'error',
    'vue/no-v-html': 'off',
    'vue/padding-line-between-blocks': 'error',
    'vue/require-name-property': 'error',
    'vue/v-slot-style': 'error',
    'vue/valid-v-bind-sync': 'error',
    'vue/valid-v-slot': 'error',
  },
}
