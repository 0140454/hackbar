module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    webextensions: true,
  },
  extends: [
    './build/eslint-config',
    './build/eslint-config/typescript',
    './build/eslint-config/vue',
  ],
}
