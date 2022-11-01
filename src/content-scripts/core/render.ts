import browser from 'webextension-polyfill'

/* Message listener */

const messageListener = async (message: BrowseResponse) => {
  let response = null

  browser.runtime.onMessage.removeListener(messageListener)

  try {
    const base = document.createElement('base')
    base.setAttribute('href', message.baseUrl)

    document.open()
    document.write(base.outerHTML + message.body)
    document.close()
  } catch (error) {
    response = (error as Error).message
  }

  return Promise.resolve(response)
}

browser.runtime.onMessage.addListener(messageListener)
