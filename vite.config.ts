import path from 'path'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import vue from '@vitejs/plugin-vue'
import { glob } from 'glob'
import { ConfigEnv, defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import iife from './build/vite-plugins/vite-plugin-iife'
import webextensionManifest, {
  AvailableTarget,
  isAvailableTarget,
} from './build/vite-plugins/vite-plugin-manifest'

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

export default defineConfig((env: ConfigEnv) => {
  const input = {
    main: 'main.html',
    devtools: 'devtools.html',
    permission: 'permission.html',
    background: 'src/background-worker/background.ts',
    ...contentScriptNames(),
  }
  const alias =
    env.mode === 'development'
      ? {
          'webextension-polyfill': path.join(
            __dirname,
            'build/modules/noop.ts',
          ),
        }
      : {
          querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
          url: 'rollup-plugin-node-polyfills/polyfills/url',
          util: 'rollup-plugin-node-polyfills/polyfills/util',
        }
  const buildTarget = process.env.VITE_BUILD_TARGET

  if (!isAvailableTarget(buildTarget)) {
    const expectedTargets = AvailableTarget.join(', ')
    console.error(
      `Unexpected build target "${buildTarget}", ${expectedTargets} expected`,
    )
    process.exit(1)
  }

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      iife(Object.keys(input)),
      webextensionManifest({
        target: buildTarget,
      }),
    ],
    css: {
      modules: {
        generateScopedName: '[name]__[local]',
      },
    },
    resolve: {
      alias,
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [NodeModulesPolyfillPlugin()],
        loader: {
          '.wasm': 'binary',
        },
      },
    },
    build: {
      outDir: `dist/${buildTarget}`,
      minify: false,
      modulePreload: {
        pollyfill: false,
      },
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
