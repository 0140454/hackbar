import browser from 'webextension-polyfill'
import tabStore from './store'

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
    tabStore.getConnection(message.tabId)!.postMessage({
      type: 'load',
      data: tabStore.getBrowseRequest(message.tabId),
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
        (header): browser.DeclarativeNetRequest.ModifyHeaderInfo => ({
          header: header.name,
          operation: 'set',
          value: header.value,
        }),
      )

    if (sessionRules.length > 0) {
      await browser.declarativeNetRequest.updateSessionRules({
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
      await browser.scripting.executeScript({
        target: {
          tabId: message.tabId,
        },
        files: ['core/post.js'],
      })

      const error = (await browser.tabs.sendMessage(
        message.tabId,
        message.data,
      )) as string
      if (error !== null) {
        tabStore.getConnection(message.tabId)!.postMessage({
          type: 'error',
          data: error,
        } as DevtoolsErrorMessage)
      }
    } else {
      await browser.tabs.update(message.tabId, {
        url: message.data.url,
      })
    }
  } else if (isTestMessage(message)) {
    if (message.data.action === 'start') {
      await browser.scripting.executeScript({
        target: {
          tabId: message.tabId,
        },
        files: [message.data.script],
      })
    }

    await browser.tabs.sendMessage(message.tabId, message.data)
  }
}

browser.runtime.onConnect.addListener(devToolsConnection => {
  const devToolsListener = (message: BackgroundFunctionMessage) => {
    tabStore.updateConnection(message.tabId, devToolsConnection)
    handleMessage(message)
  }

  devToolsConnection.onMessage.addListener(devToolsListener)
  devToolsConnection.onDisconnect.addListener(() => {
    devToolsConnection.onMessage.removeListener(devToolsListener)
  })
})

browser.runtime.onMessage.addListener(
  (
    message: DevtoolsTestMessage['data'],
    sender: browser.Runtime.MessageSender,
  ) => {
    if (sender.tab?.id) {
      tabStore.getConnection(sender.tab.id)!.postMessage({
        type: 'test',
        data: message,
      } as DevtoolsTestMessage)
    }
  },
)

const onBeforeRequestOptions: Array<browser.WebRequest.OnBeforeRequestOptions> =
  ['requestBody', chrome.webRequest.OnBeforeRequestOptions.EXTRA_HEADERS]
browser.webRequest.onBeforeRequest.addListener(
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

    tabStore.updateBrowseRequest(details.tabId, {
      url,
      body,
      headers: [], // Ignored in UI part
    })
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame'],
  },
  onBeforeRequestOptions.filter(Boolean),
)

const onBeforeSendHeadersOptions: Array<browser.WebRequest.OnBeforeSendHeadersOptions> =
  ['requestHeaders', chrome.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS]
browser.webRequest.onBeforeSendHeaders.addListener(
  details => {
    const contentTypeHeader = details.requestHeaders?.find(header => {
      return header.name.toLowerCase() === 'content-type'
    })
    if (!contentTypeHeader) {
      return
    }

    const contentType = (contentTypeHeader.value ?? '').split(';', 1)[0].trim()
    const request = tabStore.getBrowseRequest(details.tabId)
    if (request?.body) {
      request.body.enctype = contentType
    }
    tabStore.updateBrowseRequest(details.tabId, request)
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame'],
  },
  onBeforeSendHeadersOptions.filter(Boolean),
)

const handleResponseCompleted = async (
  details:
    | Parameters<
        Parameters<typeof browser.webRequest.onBeforeRedirect['addListener']>[0]
      >[0]
    | Parameters<
        Parameters<typeof browser.webRequest.onCompleted['addListener']>[0]
      >[0]
    | Parameters<
        Parameters<typeof browser.webRequest.onErrorOccurred['addListener']>[0]
      >[0],
) => {
  await browser.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [details.tabId],
  })
}

browser.webRequest.onBeforeRedirect.addListener(handleResponseCompleted, {
  urls: ['*://*/*'],
})
browser.webRequest.onCompleted.addListener(handleResponseCompleted, {
  urls: ['*://*/*'],
})
browser.webRequest.onErrorOccurred.addListener(handleResponseCompleted, {
  urls: ['*://*/*'],
})

browser.tabs.onRemoved.addListener(tabId => {
  tabStore.remove(tabId)
})

browser.commands.onCommand.addListener(async command => {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true })

  const tabId = tabs[0].id
  if (!tabId) {
    return
  }

  const connection = tabStore.getConnection(tabId)
  if (!connection) {
    return
  }

  connection.postMessage({
    type: 'command',
    data: command,
  } as DevtoolsCommandMessage)
})
