import browser from 'webextension-polyfill'

export function isSelfOrigin(val: string | URL | undefined) {
  if (!val) {
    return false
  }

  const origin = val instanceof URL ? val.origin : new URL(val).origin
  return origin === `chrome-extension://${browser.runtime.id}`
}

export async function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export async function waitForTabComplete(tabId: number) {
  return new Promise<void>(resolve => {
    const handler = (
      id: number,
      info: browser.Tabs.OnUpdatedChangeInfoType,
    ) => {
      if (info.status !== 'complete' || id != tabId) {
        return
      }

      browser.tabs.onUpdated.removeListener(handler)
      resolve()
    }

    browser.tabs.onUpdated.addListener(handler)
    browser.tabs.query({ status: 'complete' }).then(tabs => {
      if (tabs.find(tab => tab.id === tabId)) {
        browser.tabs.onUpdated.removeListener(handler)
        resolve()
      }
    })
  })
}
