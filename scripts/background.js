const tabDB = {}
const decoder = new TextDecoder()

const handleMessage = (message, sender, sendResponse) => {
  if (message.type === 'load') {
    tabDB[message.tabId].connection.postMessage({
      type: 'load',
      data: tabDB[message.tabId].request
    })
  } else if (message.type === 'execute') {
    tabDB[message.tabId].modifiedHeaders = message.data.headers

    if (message.data.body.enabled) {
      if (message.data.body.enctype === 'application/json') {
        tabDB[message.tabId].modifiedHeaders.unshift({
          enabled: true,
          name: 'content-type',
          value: 'application/json'
        })
      }

      chrome.tabs.executeScript(message.tabId, {
        file: 'scripts/lib/post.js'
      }, () => {
        chrome.tabs.sendMessage(message.tabId, message.data, response => {
          if (response === null) {
            return
          }

          tabDB[message.tabId].connection.postMessage({
            type: 'error',
            data: response
          })
        })
      })
    } else {
      chrome.tabs.update(message.tabId, {
        url: message.data.url
      })
    }
  } else if (message.type === 'test') {
    if (message.data.action === 'start') {
      chrome.tabs.executeScript(message.tabId, {
        file: message.data.script
      }, () => {
        chrome.tabs.sendMessage(message.tabId, message.data)
      })
    } else {
      chrome.tabs.sendMessage(message.tabId, message.data)
    }
  }
}

chrome.runtime.onConnect.addListener(devToolsConnection => {
  const devToolsListener = (message, sender, sendResponse) => {
    let tabData = tabDB[message.tabId] || {}

    tabData.connection = devToolsConnection
    tabDB[message.tabId] = tabData

    handleMessage(message, sender, sendResponse)
  }

  devToolsConnection.onMessage.addListener(devToolsListener)
  devToolsConnection.onDisconnect.addListener(() => {
    devToolsConnection.onMessage.removeListener(devToolsListener)
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.tab) {
    tabDB[sender.tab.id].connection.postMessage({
      type: 'test',
      data: message
    })
  }
})

chrome.webRequest.onBeforeRequest.addListener(details => {
  let tabData = tabDB[details.tabId] || {}

  if (typeof tabData.request === 'undefined') {
    tabData.request = {}
  }

  tabData.request.url = details.url
  if (typeof details.requestBody !== 'undefined') {
    tabData.request.body = details.requestBody

    if (typeof tabData.request.body.raw !== 'undefined') {
      for (const idx in tabData.request.body.raw) {
        if (typeof tabData.request.body.raw[idx].bytes === 'undefined') {
          continue
        }

        tabData.request.body.raw[idx].bytes = decoder.decode(
          tabData.request.body.raw[idx].bytes)
      }
    }
  } else {
    delete tabData.request.body
  }

  tabDB[details.tabId] = tabData
}, { urls: ['<all_urls>'], types: ['main_frame'] }, ['blocking', 'requestBody'])

chrome.webRequest.onBeforeSendHeaders.addListener(details => {
  delete tabDB[details.tabId].request.contentType

  for (const idx in details.requestHeaders) {
    if (details.requestHeaders[idx].name.toLowerCase() === 'content-type') {
      tabDB[details.tabId].request.contentType = details.requestHeaders[idx].value
      break
    }
  }

  if (typeof tabDB[details.tabId].modifiedHeaders === 'undefined') {
    return
  }

  const modifiedHeaders = tabDB[details.tabId].modifiedHeaders.filter(header => {
    return header.enabled === true && header.name.length > 0
  })

  if (modifiedHeaders.length === 0) {
    return
  }

  modifiedHeaders.forEach(header => {
    let idx = 0
    for (; idx < details.requestHeaders.length; idx++) {
      if (details.requestHeaders[idx].name.toLowerCase() ===
          header.name.toLowerCase()) {
        details.requestHeaders[idx].value = header.value
        break
      }
    }

    if (idx === details.requestHeaders.length) {
      details.requestHeaders.push({
        name: header.name,
        value: header.value
      })
    }

    if (header.name.toLowerCase() === 'content-type') {
      tabDB[details.tabId].request.contentType = header.value
    }
  })

  delete tabDB[details.tabId].modifiedHeaders

  return { requestHeaders: details.requestHeaders }
}, {
  urls: ['<all_urls>'],
  types: ['main_frame']
}, (parseInt(/Chrome\/([0-9]+)/.exec(navigator.userAgent)[1]) >= 72) ? [
  'blocking',
  'extraHeaders',
  'requestHeaders'
] : [
  'blocking',
  'requestHeaders'
])

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  delete tabDB[tabId]
})

chrome.commands.onCommand.addListener(command => {
  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
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
