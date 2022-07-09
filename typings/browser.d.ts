// HACK: declare types for missing functionality to avoid build failure.

import browser from 'webextension-polyfill'

declare module 'webextension-polyfill' {
  export const declarativeNetRequest: any

  namespace DeclarativeNetRequest {
    interface ModifyHeaderInfo {}
  }

  namespace Storage {
    interface Static {
      session: any
    }
  }
}
