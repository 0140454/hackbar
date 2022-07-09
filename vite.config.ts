import path from 'path'
import vue from '@vitejs/plugin-vue'
import glob from 'glob'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import iife from './build/vite-plugin-iife'
import webextensionManifest, {
  ManifestTarget,
} from './build/vite-plugin-manifest'

function contentScriptNames() {
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

export default defineConfig(() => {
  const input = {
    main: 'main.html',
    devtools: 'devtools.html',
    background: 'src/background-workers/background.ts',
    ...contentScriptNames(),
  }

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      iife(Object.keys(input)),
      webextensionManifest({
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
        input,
        output: {
          assetFileNames: 'assets/[name].[ext]',
          chunkFileNames: '[name].js',
          entryFileNames: '[name].js',
        },
      },
    },
  }
})
