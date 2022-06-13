const tabDB = {}
const decoder = new TextDecoder()

const enctypeNeededToOverrideHeader = [
  'application/json',
  'application/x-www-form-urlencoded (raw)',
]

const handleMessage = message => {
  if (message.type === 'load') {
    tabDB[message.tabId].connection.postMessage({
      type: 'load',
      data: tabDB[message.tabId].request,
    })
  } else if (message.type === 'execute') {
    const modifiedHeaders = message.data.headers
    if (
      message.data.body.enabled &&
      enctypeNeededToOverrideHeader.indexOf(message.data.body.enctype) >= 0
    ) {
      const enctype = message.data.body.enctype.split(' ', 1)[0]

      modifiedHeaders.unshift({
        enabled: true,
        name: 'content-type',
        value: enctype,
      })
      tabDB[message.tabId].request.contentType = enctype
    }

    const sessionRules = modifiedHeaders
      .filter(header => header.enabled)
      .map(header => ({
        ...header,
        name: header.name.toLowerCase(),
      }))
      .map(header => ({
        header: header.name,
        operation: 'set',
        value: header.value,
      }))
    const sessionRuleId =
      message.tabId * 10000 + (tabDB[message.tabId].sessionRuleId++ % 10000)
    chrome.declarativeNetRequest.updateSessionRules(
      {
        addRules: [
          {
            id: sessionRuleId,
            action: {
              type: 'modifyHeaders',
              requestHeaders: sessionRules,
            },
            condition: {
              tabIds: [message.tabId],
              resourceTypes: ['main_frame'],
            },
          },
        ],
      },
      () => {
        tabDB[message.tabId].sessionRuleIds = [sessionRuleId]
      },
    )

    if (message.data.body.enabled) {
      chrome.scripting.executeScript(
        {
          target: {
            tabId: message.tabId,
          },
          files: ['scripts/lib/post.js'],
        },
        () => {
          chrome.tabs.sendMessage(message.tabId, message.data, response => {
            if (response === null) {
              return
            }

            tabDB[message.tabId].connection.postMessage({
              type: 'error',
              data: response,
            })
          })
        },
      )
    } else {
      chrome.tabs.update(message.tabId, {
        url: message.data.url,
      })
    }
  } else if (message.type === 'test') {
    if (message.data.action === 'start') {
      chrome.scripting.executeScript(
        {
          target: {
            tabId: message.tabId,
          },
          files: [message.data.script],
        },
        () => {
          chrome.tabs.sendMessage(message.tabId, message.data)
        },
      )
    } else {
      chrome.tabs.sendMessage(message.tabId, message.data)
    }
  }
}

chrome.runtime.onConnect.addListener(devToolsConnection => {
  const devToolsListener = (message, sender, sendResponse) => {
    const tabData = tabDB[message.tabId] || {}

    tabData.connection = devToolsConnection
    tabData.sessionRuleId = 1
    tabDB[message.tabId] = tabData

    handleMessage(message, sender, sendResponse)
  }

  devToolsConnection.onMessage.addListener(devToolsListener)
  devToolsConnection.onDisconnect.addListener(() => {
    devToolsConnection.onMessage.removeListener(devToolsListener)
  })
})

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab) {
    tabDB[sender.tab.id].connection.postMessage({
      type: 'test',
      data: message,
    })
  }
})

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const tabData = tabDB[details.tabId] || {}

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
            tabData.request.body.raw[idx].bytes,
          )
        }
      }
    } else {
      delete tabData.request.body
    }

    tabDB[details.tabId] = tabData
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  },
  ['extraHeaders', 'requestBody'],
)

const handleResponseCompleted = details => {
  if (!tabDB[details.tabId]?.sessionRuleIds) {
    return
  }

  chrome.declarativeNetRequest.updateSessionRules(
    {
      removeRuleIds: tabDB[details.tabId].sessionRuleIds,
    },
    () => {
      tabDB[details.tabId].sessionRuleIds = null
    },
  )
}

chrome.webRequest.onBeforeRedirect.addListener(handleResponseCompleted, {
  urls: ['<all_urls>'],
})
chrome.webRequest.onCompleted.addListener(handleResponseCompleted, {
  urls: ['<all_urls>'],
})
chrome.webRequest.onErrorOccurred.addListener(handleResponseCompleted, {
  urls: ['<all_urls>'],
})

chrome.tabs.onRemoved.addListener(tabId => {
  delete tabDB[tabId]
})

chrome.commands.onCommand.addListener(command => {
  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    if (
      typeof tabDB[tabs[0].id] === 'undefined' ||
      typeof tabDB[tabs[0].id].connection === 'undefined'
    ) {
      return
    }

    tabDB[tabs[0].id].connection.postMessage({
      type: 'command',
      data: command,
    })
  })
})
