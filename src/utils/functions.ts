import browser from 'webextension-polyfill'

export function isSelfOrigin(val: string | URL | undefined) {
  if (!val) {
    return false
  }

  const origin = val instanceof URL ? val.origin : new URL(val).origin
  return origin === `chrome-extension://${browser.runtime.id}`
}
