const tabDB = {}

const escapeHtml = function (html) {
  if (typeof html === 'undefined') {
    return undefined
  }

  return html
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;')
}

const handleMessage = function (message, sender, sendResponse) {
  if (message.type === 'load') {
    tabDB[message.tabId].connection.postMessage({
      type: 'load',
      data: tabDB[message.tabId].request
    })
  } else if (message.type === 'execute') {
    tabDB[message.tabId].modifiedHeaders = message.data.headers

    if (message.data.body.enabled) {
      chrome.tabs.executeScript(message.tabId, {
        code: `const url = "${encodeURIComponent(message.data.url)}";
                const body = "${escapeHtml(message.data.body.content)}";`
      }, function () {
        chrome.tabs.executeScript(message.tabId, {
          file: 'scripts/lib/post-request.js'
        })
      })
    } else {
      chrome.tabs.update(message.tabId, {
        url: message.data.url
      })
    }
  }
}

chrome.runtime.onConnect.addListener(function (devToolsConnection) {
  const devToolsListener = function (message, sender, sendResponse) {
    let tabData = tabDB[message.tabId] || {}

    tabData.connection = devToolsConnection
    tabDB[message.tabId] = tabData

    handleMessage(message, sender, sendResponse)
  }

  devToolsConnection.onMessage.addListener(devToolsListener)
  devToolsConnection.onDisconnect.addListener(function () {
    devToolsConnection.onMessage.removeListener(devToolsListener)
  })
})

chrome.webRequest.onBeforeRequest.addListener(function (details) {
  let tabData = tabDB[details.tabId] || {}

  if (typeof tabData.request === 'undefined') {
    tabData.request = {}
  }

  tabData.request.url = details.url
  if (typeof details.requestBody !== 'undefined') {
    tabData.request.body = (typeof details.requestBody.formData !== 'undefined')
      ? details.requestBody.formData
      : ''
  } else {
    delete tabData.request.body
  }

  tabDB[details.tabId] = tabData
}, { urls: ['<all_urls>'], types: ['main_frame'] }, ['requestBody'])

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
  if (typeof tabDB[details.tabId].modifiedHeaders === 'undefined') {
    return
  }

  const modifiedHeaders = tabDB[details.tabId].modifiedHeaders.filter(
    function (header) {
      return header.enabled === true && header.name.length > 0
    })

  if (modifiedHeaders.length === 0) {
    return
  }

  modifiedHeaders.forEach(function (header) {
    for (const idx in details.requestHeaders) {
      if (details.requestHeaders[idx].name.toLowerCase() ===
          header.name.toLowerCase()) {
        details.requestHeaders[idx].value = header.value
        break
      }
    }
  })

  delete tabDB[details.tabId].modifiedHeaders

  return { requestHeaders: details.requestHeaders }
}, { urls: ['<all_urls>'], types: ['main_frame'] }, ['blocking', 'requestHeaders'])

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  delete tabDB[tabId]
})

chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    if (typeof tabDB[tabs[0].id] === 'undefined' ||
        typeof tabDB[tabs[0].id].connection === 'undefined') {
      return
    }

    tabDB[tabs[0].id].connection.postMessage({
      type: 'command',
      data: command
    })
  })
})
