// HACK: declare types for missing functionality to avoid build failure.

import browser from 'webextension-polyfill'

declare module 'webextension-polyfill' {
  namespace Storage {
    interface Static {
      session: typeof chrome.storage.session
    }
  }
}
