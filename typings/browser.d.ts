// HACK: declare types for missing functionality to avoid build failure.

import browser from 'webextension-polyfill'

declare module 'webextension-polyfill' {
  export const declarativeNetRequest: typeof chrome.declarativeNetRequest

  namespace DeclarativeNetRequest {
    type ModifyHeaderInfo = chrome.declarativeNetRequest.ModifyHeaderInfo
  }

  namespace Storage {
    interface Static {
      session: typeof chrome.storage.session
    }
  }
}
