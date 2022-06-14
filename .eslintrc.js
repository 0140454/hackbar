module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    webextensions: true,
  },
  extends: [
    './eslint-config',
    './eslint-config/typescript',
    './eslint-config/vue',
  ],
}
