import { isArray, mergeWith } from 'lodash'
import { Plugin } from 'vite'
import packageJson from '../../package.json'

const baseManifest = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  devtools_page: 'devtools.html',
  icons: {
    '128': 'icon.png',
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
  },
  permissions: ['storage', 'scripting', 'webRequest'],
  host_permissions: ['*://*/*'],
  web_accessible_resources: [
    {
      resources: ['payloads/*'],
      matches: ['*://*/*'],
    },
  ],
  commands: {
    load_url: {
      suggested_key: {
        default: 'Alt+A',
        mac: 'MacCtrl+A',
      },
      description: "Trigger 'Load'",
    },
    split_url: {
      suggested_key: {
        default: 'Alt+S',
        mac: 'MacCtrl+S',
      },
      description: "Trigger 'Split'",
    },
    execute_url: {
      suggested_key: {
        default: 'Alt+X',
        mac: 'MacCtrl+X',
      },
      description: "Trigger 'Execute'",
    },
  },
  manifest_version: 3,
}

const chromeManifest = {
  background: {
    service_worker: 'background.js',
  },
  permissions: ['declarativeNetRequest'],
  minimum_chrome_version: '102',
}

const firefoxManifest = {
  background: {
    scripts: ['background.js'],
  },
  browser_specific_settings: {
    gecko: {
      id: '{e369192d-43df-486e-aca0-d771eaed541d}',
    },
  },
}

const extendedManifest = {
  chrome: chromeManifest,
  firefox: firefoxManifest,
}

const mergeCustomizer = (objValue, srcValue) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

export type ManifestTarget = keyof typeof extendedManifest

export default function ({ target }: { target: ManifestTarget }): Plugin {
  return {
    name: 'vite-plugin-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify(
          mergeWith(
            {},
            baseManifest,
            extendedManifest[target],
            mergeCustomizer,
          ),
          undefined,
          2,
        ),
      })
    },
  }
}
