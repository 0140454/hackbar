import * as path from 'path'
import vue from '@vitejs/plugin-vue'
import * as glob from 'glob'
import { defineConfig } from 'vite'

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify'

function generateContentScriptsConfig() {
  const contentScriptsDir = `${__dirname}/src/content-scripts`

  return glob
    .sync(`${contentScriptsDir}/**/*.{js,ts}`)
    .reduce((result, file) => {
      const parsedPath = path.parse(path.relative(contentScriptsDir, file))
      const entryName = `${parsedPath.dir}/${parsedPath.name}`

      result[entryName] = file
      return result
    }, {})
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  css: {
    modules: {
      generateScopedName: '[name]__[local]',
    },
  },
  build: {
    minify: false,
    polyfillModulePreload: false,
    rollupOptions: {
      input: {
        main: 'main.html',
        devtools: 'devtools.html',
        background: 'src/background.ts',
        ...generateContentScriptsConfig(),
      },
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
      },
    },
  },
})
