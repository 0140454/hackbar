// HACK: declare types for missing functionality to avoid build failure.

import browser from 'webextension-polyfill'

declare module 'webextension-polyfill' {
  namespace Storage {
    interface StorageArea {
      QUOTA_BYTES: typeof chrome.storage.session.QUOTA_BYTES
    }
  }
}
