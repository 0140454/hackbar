const tabDB: Record<
  number,
  {
    connection?: chrome.runtime.Port
    request?: BrowseRequest
  }
> = {}
const decoder = new TextDecoder()

const enctypeNeededToOverrideHeader = [
  'application/json',
  'application/x-www-form-urlencoded (raw)',
]

const isLoadMessage = (m: Message): m is LoadMessage => {
  return m.type === 'load'
}

const isExecuteMessage = (m: Message): m is ExecuteMessage => {
  return m.type === 'execute'
}

const isTestMessage = (m: Message): m is TestMessage => {
  return m.type === 'test'
}

const handleMessage = async (message: Message) => {
  if (isLoadMessage(message)) {
    tabDB[message.tabId].connection!.postMessage({
      type: 'load',
      data: tabDB[message.tabId].request,
    })
  } else if (isExecuteMessage(message)) {
    const modifiedHeaders = message.data.headers
    if (
      message.data.body.enabled &&
      enctypeNeededToOverrideHeader.includes(message.data.body.enctype)
    ) {
      const enctype = message.data.body.enctype.split(' ', 1)[0]

      modifiedHeaders.push({
        enabled: true,
        name: 'content-type',
        value: enctype,
      })
    }

    const sessionRules = modifiedHeaders
      .filter(header => header.enabled && header.name.length > 0)
      .map(header => ({
        header: header.name,
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
        value: header.value,
      }))

    if (sessionRules.length > 0) {
      await chrome.declarativeNetRequest.updateSessionRules({
        addRules: [
          {
            id: message.tabId,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
              requestHeaders: sessionRules,
            },
            condition: {
              tabIds: [message.tabId],
              resourceTypes: [
                chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
              ],
            },
          },
        ],
      })
    }

    if (message.data.body.enabled) {
      await chrome.scripting.executeScript({
        target: {
          tabId: message.tabId,
        },
        files: ['scripts/lib/post.js'],
      })

      const error = await chrome.tabs.sendMessage(message.tabId, message.data)
      if (error !== null) {
        tabDB[message.tabId].connection!.postMessage({
          type: 'error',
          data: error,
        })
      }
    } else {
      await chrome.tabs.update(message.tabId, {
        url: message.data.url,
      })
    }
  } else if (isTestMessage(message)) {
    if (message.data.action === 'start') {
      await chrome.scripting.executeScript({
        target: {
          tabId: message.tabId,
        },
        files: [message.data.script],
      })
    }

    await chrome.tabs.sendMessage(message.tabId, message.data)
  }
}

chrome.runtime.onConnect.addListener(devToolsConnection => {
  const devToolsListener = (message: Message) => {
    const tabData = tabDB[message.tabId] || {}

    tabData.connection = devToolsConnection
    tabDB[message.tabId] = tabData

    handleMessage(message)
  }

  devToolsConnection.onMessage.addListener(devToolsListener)
  devToolsConnection.onDisconnect.addListener(() => {
    devToolsConnection.onMessage.removeListener(devToolsListener)
  })
})

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab?.id) {
    tabDB[sender.tab.id].connection!.postMessage({
      type: 'test',
      data: message,
    })
  }
})

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const requestBody = details.requestBody
    let bodyContent = ''

    if (requestBody?.formData) {
      const params = new URLSearchParams()

      for (const name in requestBody?.formData) {
        requestBody?.formData[name].forEach(value => {
          params.append(name, value)
        })
      }

      bodyContent = params.toString()
    } else if (requestBody?.raw) {
      bodyContent = requestBody?.raw
        ?.map(data => {
          if (data.file) {
            return `[Content of '${data.file}']`
          }
          if (!data.bytes) {
            return ''
          }

          return decoder.decode(data.bytes)
        })
        .join('')
    }

    const url = details.url
    const body: BrowseRequest['body'] = {
      enabled: !!requestBody,
      enctype: 'application/x-www-form-urlencoded', // Update in onBeforeSendHeaders
      content: bodyContent,
    }

    tabDB[details.tabId] = {
      request: {
        url,
        body,
        headers: [], // Ignored in UI part
      },
    }
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  },
  ['extraHeaders', 'requestBody'],
)

chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    const contentTypeHeader = details.requestHeaders?.find(header => {
      return header.name.toLowerCase() === 'content-type'
    })
    if (!contentTypeHeader) {
      return
    }

    const contentType = (contentTypeHeader.value ?? '').split(';', 1)[0].trim()
    const bodyObject = tabDB[details.tabId].request?.body
    if (bodyObject) {
      bodyObject.enctype = contentType
    }
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  },
  ['extraHeaders', 'requestHeaders'],
)

const handleResponseCompleted = async (
  details:
    | chrome.webRequest.WebRedirectionResponseDetails
    | chrome.webRequest.WebResponseCacheDetails
    | chrome.webRequest.WebResponseErrorDetails,
) => {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [details.tabId],
  })
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

chrome.commands.onCommand.addListener(async command => {
  const tabs = await chrome.tabs.query({ currentWindow: true, active: true })

  const tabId = tabs[0].id
  if (!tabId) {
    return
  }

  const connection = tabDB[tabId].connection
  if (!connection) {
    return
  }

  connection.postMessage({
    type: 'command',
    data: command,
  })
})
