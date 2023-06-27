import browser from 'webextension-polyfill'
import bodyProcessors from '../processors'
import {
  checkExtensionPermission,
  openExtensionPermissionGrantPage,
} from '../utils/functions'
import { FetchRequestExecutor } from './fetch-request-executor'
import { FrameRequestExecutor } from './frame-request-executor'
import store from './store'

const decoder = new TextDecoder()

function isInitMessage(
  m: BackgroundFunctionMessage,
): m is BackgroundInitMessage {
  return m.type === 'init'
}

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

function isRenderMessage(
  m: BackgroundFunctionMessage,
): m is BackgroundRenderMessage {
  return m.type === 'render'
}

/* Communication */

const handleMessage = async (message: BackgroundFunctionMessage) => {
  const connection = (await store.getConnection(message.tabId))!

  if (isInitMessage(message)) {
    if (await checkExtensionPermission()) {
      return
    }

    openExtensionPermissionGrantPage()
  } else if (isLoadMessage(message)) {
    connection.postMessage({
      type: 'load',
      data: await store.getBrowseRequest(message.tabId),
    })
  } else if (isExecuteMessage(message)) {
    const { rawMode: isRawMode, request } = message.data
    const executor = isRawMode
      ? new FetchRequestExecutor(message.tabId, request)
      : new FrameRequestExecutor(message.tabId, request)
    const result = await executor.execute()

    connection.postMessage(result)
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
  } else if (isRenderMessage(message)) {
    await browser.scripting.executeScript({
      target: {
        tabId: message.tabId,
      },
      files: ['core/render.js'],
    })
    await browser.tabs.sendMessage(message.tabId, message.data)
  }
}

browser.runtime.onConnect.addListener(devToolsConnection => {
  const devToolsListener = async (message: BackgroundFunctionMessage) => {
    await store.updateConnection(message.tabId, devToolsConnection)
    handleMessage(message)
  }

  devToolsConnection.onMessage.addListener(devToolsListener)
  devToolsConnection.onDisconnect.addListener(() => {
    devToolsConnection.onMessage.removeListener(devToolsListener)
  })
})

browser.runtime.onMessage.addListener(
  async (
    message: DevtoolsTestMessage['data'],
    sender: browser.Runtime.MessageSender,
  ) => {
    if (sender.tab?.id) {
      const connection = (await store.getConnection(sender.tab.id))!

      connection.postMessage({
        type: 'test',
        data: message,
      })
    }
  },
)

/* Request recorder */

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

    store.updateBrowseRequest(details.tabId, {
      url,
      body,
      method: details.method.toUpperCase(),
      headers: [], // Ignored in UI
      followRedirect: false, // Ignored in UI
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
    store.getBrowseRequest(details.tabId).then(request => {
      details.requestHeaders?.forEach(({ name, value }, idx) => {
        request!.headers.push({
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

          request!.body.enctype = processor.getName()
        }
      })

      store.updateBrowseRequest(details.tabId, request)
    })
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame'],
  },
  onBeforeSendHeadersOptions.filter(Boolean),
)

browser.tabs.onRemoved.addListener(async tabId => {
  await store.remove(tabId)
})

/* Shortcut handler */

browser.commands.onCommand.addListener(async command => {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true })

  const tabId = tabs[0].id
  if (!tabId) {
    return
  }

  const connection = await store.getConnection(tabId)
  if (!connection) {
    return
  }

  connection.postMessage({
    type: 'command',
    data: command,
  } as DevtoolsCommandMessage)
})

/* Permission handler */

browser.runtime.onInstalled.addListener(async details => {
  if (details.reason != 'install') {
    return
  }

  if (await checkExtensionPermission()) {
    return
  }

  openExtensionPermissionGrantPage()
})
