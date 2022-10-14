import browser from 'webextension-polyfill'
import bodyProcessors from '../processors'
import {
  BodyAvailableMethods,
  DefaultSentRequestHeaders,
} from '../utils/constants'
import tabStore from './store'

const decoder = new TextDecoder()

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
    })
  } else if (isExecuteMessage(message)) {
    const { rawMode: isRawMode, request } = message.data
    const modifiedHeaders = request.headers.filter(
      header => header.enabled && header.name.length > 0,
    )

    if (isRawMode) {
      const enabledHeaderNames = modifiedHeaders.map(header =>
        header.name.toLowerCase(),
      )
      DefaultSentRequestHeaders.forEach(name => {
        if (enabledHeaderNames.includes(name.toLowerCase())) {
          return
        }

        modifiedHeaders.push({
          enabled: true,
          name,
          value: '',
          removeIfEmptyValue: true,
          _createdAt: 0, // Useless in background
        })
      })
    } else if (BodyAvailableMethods.includes(request.method)) {
      const processor = bodyProcessors.find(request.body.enctype)
      if (!processor) {
        throw new Error('Unsupported enctype')
      }

      if (processor.getFormEnctype() != processor.getHttpContentType()) {
        modifiedHeaders.push({
          enabled: true,
          name: 'content-type',
          value: processor.getHttpContentType(),
          removeIfEmptyValue: false,
          _createdAt: 0, // Useless in background
        })
      }
    }

    const sessionRules = modifiedHeaders.map(
      (header): browser.DeclarativeNetRequest.ModifyHeaderInfo => {
        if (header.value.length !== 0 || !header.removeIfEmptyValue) {
          return {
            header: header.name,
            operation: 'set',
            value: header.value,
          }
        } else {
          return {
            header: header.name,
            operation: 'remove',
          }
        }
      },
    )
    const updateRuleOptions: browser.DeclarativeNetRequest.UpdateRuleOptions = {
      removeRuleIds: [message.tabId],
    }

    if (sessionRules.length > 0) {
      const ruleCondition: browser.DeclarativeNetRequest.RuleCondition =
        isRawMode
          ? {
              initiatorDomains: [browser.runtime.id],
              resourceTypes: ['xmlhttprequest'],
            }
          : {
              tabIds: [message.tabId],
              resourceTypes: ['main_frame'],
            }

      updateRuleOptions['addRules'] = [
        {
          id: message.tabId,
          action: {
            type: 'modifyHeaders',
            requestHeaders: sessionRules,
          },
          condition: ruleCondition,
        },
      ]
    }
    await browser.declarativeNetRequest.updateSessionRules(updateRuleOptions)

    if (isRawMode) {
      const requestInit: RequestInit = {
        method: request.method,
        cache: 'no-store',
        ...(BodyAvailableMethods.includes(request.method)
          ? { body: request.body.content }
          : {}),
      }

      try {
        const response = await fetch(request.url, requestInit)
        const bodyText = await response.text()
        const headers = Array.from(response.headers.entries()).map(
          ([name, value]) => ({ name, value }),
        )

        tabStore.getConnection(message.tabId)!.postMessage({
          type: 'execute',
          data: {
            statusCode: response.status,
            statusMessage: response.statusText,
            headers,
            body: bodyText,
          },
        })
      } catch (error) {
        tabStore.getConnection(message.tabId)!.postMessage({
          type: 'error',
          data: (error as Error).message,
        })
      } finally {
        await browser.declarativeNetRequest.updateSessionRules({
          removeRuleIds: [message.tabId],
        })
      }
    } else if (BodyAvailableMethods.includes(request.method)) {
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
        })
      }
    } else {
      await browser.tabs.update(message.tabId, {
        url: request.url,
      })
    }
  } else if (isTestMessage(message)) {
    if (message.data.action === 'start') {
      await browser.scripting.executeScript({
        target: {
          tabId: message.tabId,
        },
        files: [message.data.script!],
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
      })
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
      enctype: bodyProcessors.getDefaultProcessorName(), // Updated in onBeforeSendHeaders
      content: bodyContent,
    }

    tabStore.updateBrowseRequest(details.tabId, {
      url,
      body,
      method: details.method.toUpperCase(),
      headers: [], // Ignored in UI
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
    const request = tabStore.getBrowseRequest(details.tabId)!

    details.requestHeaders?.forEach(({ name, value }, idx) => {
      request.headers.push({
        enabled: true,
        name,
        value: value ?? '',
        removeIfEmptyValue: false,
        _createdAt: Date.now() * 1000 + idx,
      })

      if (name.toLowerCase() === 'content-type') {
        const processor =
          bodyProcessors.findByContentType(value ?? '') ??
          bodyProcessors.getDefaultProcessor()

        request.body.enctype = processor.getName()
      }
    })

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
  types: ['main_frame'],
})
browser.webRequest.onCompleted.addListener(handleResponseCompleted, {
  urls: ['*://*/*'],
  types: ['main_frame'],
})
browser.webRequest.onErrorOccurred.addListener(handleResponseCompleted, {
  urls: ['*://*/*'],
  types: ['main_frame'],
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
  })
})
