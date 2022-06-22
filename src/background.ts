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

function isLoadMessage(
  m: BackgroundFunctionMessage,
): m is BackgroundLoadMessage {
  return m.type === 'load'
}

function isExecuteMessage(
  m: BackgroundFunctionMessage,
): m is BackgroundExecuteMessage {
  return m.type === 'execute'
}

function isTestMessage(
  m: BackgroundFunctionMessage,
): m is BackgroundTestMessage {
  return m.type === 'test'
}

const handleMessage = async (message: BackgroundFunctionMessage) => {
  if (isLoadMessage(message)) {
    tabDB[message.tabId].connection!.postMessage({
      type: 'load',
      data: tabDB[message.tabId].request,
    } as DevtoolsLoadMessage)
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
        _createdAt: 0, // Useless in background
      })
    }

    const sessionRules = modifiedHeaders
      .filter(header => header.enabled && header.name.length > 0)
      .map(
        (header): chrome.declarativeNetRequest.ModifyHeaderInfo => ({
          header: header.name,
          operation: 'set',
          value: header.value,
        }),
      )

    if (sessionRules.length > 0) {
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [message.tabId],
        addRules: [
          {
            id: message.tabId,
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
      })
    }

    if (message.data.body.enabled) {
      await chrome.scripting.executeScript({
        target: {
          tabId: message.tabId,
        },
        files: ['core/post.js'],
      })

      const error = (await chrome.tabs.sendMessage(
        message.tabId,
        message.data,
      )) as string
      if (error !== null) {
        tabDB[message.tabId].connection!.postMessage({
          type: 'error',
          data: error,
        } as DevtoolsErrorMessage)
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
  const devToolsListener = (message: BackgroundFunctionMessage) => {
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

chrome.runtime.onMessage.addListener(
  (
    message: DevtoolsTestMessage['data'],
    sender: chrome.runtime.MessageSender,
  ) => {
    if (sender.tab?.id) {
      tabDB[sender.tab.id].connection!.postMessage({
        type: 'test',
        data: message,
      } as DevtoolsTestMessage)
    }

    return undefined
  },
)

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const requestBody = details.requestBody
    let bodyContent = ''

    if (requestBody?.formData) {
      const params = new URLSearchParams()

      for (const name in requestBody?.formData) {
        requestBody?.formData[name].forEach(value => {
          const fieldContent =
            value instanceof ArrayBuffer ? decoder.decode(value) : value
          params.append(name, fieldContent)
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
      enctype: 'application/x-www-form-urlencoded', // Updated in onBeforeSendHeaders
      content: bodyContent,
    }

    tabDB[details.tabId] = tabDB[details.tabId] || {}
    tabDB[details.tabId].request = {
      url,
      body,
      headers: [], // Ignored in UI part
    }

    return undefined
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

    return undefined
  },
  {
    urls: ['<all_urls>'],
    types: ['main_frame'],
  },
  ['extraHeaders', 'requestHeaders'],
)

const handleResponseCompleted = async (
  details:
    | Parameters<
        Parameters<typeof chrome.webRequest.onBeforeRedirect['addListener']>[0]
      >[0]
    | Parameters<
        Parameters<typeof chrome.webRequest.onCompleted['addListener']>[0]
      >[0]
    | Parameters<
        Parameters<typeof chrome.webRequest.onErrorOccurred['addListener']>[0]
      >[0],
) => {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [details.tabId],
  })

  return undefined
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
  } as DevtoolsCommandMessage)
})

export {}
