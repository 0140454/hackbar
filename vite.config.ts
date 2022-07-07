import * as path from 'path'
import vue from '@vitejs/plugin-vue'
import * as glob from 'glob'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import webExtensionManifest, {
  ManifestTarget,
} from './build/vite-plugin-webextension-manifest'

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

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    webExtensionManifest({
      target: (process.env.TARGET as ManifestTarget) ?? 'chrome',
    }),
  ],
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
        background: 'src/background-workers/background.ts',
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
