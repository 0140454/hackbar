import CryptoJS from 'crypto-js'
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

export function generateRandomHexString(numBytes: number) {
  return CryptoJS.lib.WordArray.random(numBytes).toString(
    CryptoJS.enc.Base64url,
  )
}

export function binarySearch<T>(objects: Array<T>, cmp: (object: T) => number) {
  let left = 0
  let right = objects.length - 1

  while (left <= right) {
    const middle = left + Math.floor((right - left) / 2)
    const cmpResult = cmp(objects[middle])

    if (cmpResult < 0) {
      left = middle + 1
    } else if (cmpResult > 0) {
      right = middle - 1
    } else {
      return middle
    }
  }

  return left
}
