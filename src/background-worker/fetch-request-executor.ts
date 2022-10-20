import browser from 'webextension-polyfill'
import {
  BodyAvailableMethods,
  DefaultSentRequestHeaders,
} from '../utils/constants'
import { isSelfOrigin } from '../utils/functions'
import { RequestExecutor } from './request-executor'
import store from './store'

export class FetchRequestExecutor extends RequestExecutor {
  responseInfo: Omit<BrowseResponse, 'body'>

  constructor(tabId: number, request: BrowseRequest) {
    super(tabId, request)

    this.responseInfo = {
      protocolVersion: '',
      statusCode: 0,
      statusMessage: '',
      headers: [],
    }
  }

  setupAdditionalHeaders() {
    const existedHeaderNames = this.request.headers
      .filter(header => header.enabled && header.name.length > 0)
      .map(header => header.name.toLowerCase())

    DefaultSentRequestHeaders.forEach(name => {
      if (existedHeaderNames.includes(name.toLowerCase())) {
        return
      }

      this.request.headers.push({
        enabled: true,
        name,
        value: '',
        removeIfEmptyValue: true,
        _createdAt: 0, // Useless in background
      })
    })
  }

  getModifyHeaderCondition(): browser.DeclarativeNetRequest.RuleCondition {
    return {
      initiatorDomains: [browser.runtime.id],
      resourceTypes: ['xmlhttprequest'],
    }
  }

  setupModifyHeaderRuleCleaner(ruleId: number) {
    const handler = async (
      details:
        | Parameters<
            Parameters<typeof browser.webRequest.onCompleted['addListener']>[0]
          >[0]
        | Parameters<
            Parameters<
              typeof browser.webRequest.onErrorOccurred['addListener']
            >[0]
          >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      await browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      })

      browser.webRequest.onCompleted.removeListener(handler)
      browser.webRequest.onErrorOccurred.removeListener(handler)
    }

    browser.webRequest.onCompleted.addListener(handler, {
      urls: ['*://*/*'],
      types: ['xmlhttprequest'],
    })
    browser.webRequest.onErrorOccurred.addListener(handler, {
      urls: ['*://*/*'],
      types: ['xmlhttprequest'],
    })
  }

  async setupEventHandlers() {
    const ruleId = store.allocateRuleId()

    const onBeforeRequestHandler = (
      details: Parameters<
        Parameters<typeof browser.webRequest.onBeforeRequest['addListener']>[0]
      >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      browser.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler)

      browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
        addRules: [
          {
            id: ruleId,
            action: {
              type: 'redirect',
              redirect: {
                url: browser.runtime.getURL('/blank'),
              },
            },
            condition: {
              initiatorDomains: [browser.runtime.id],
              regexFilter: '.+',
              resourceTypes: ['xmlhttprequest'],
            },
          },
        ],
      })
    }
    browser.webRequest.onBeforeRequest.addListener(onBeforeRequestHandler, {
      urls: ['*://*/*'],
      types: ['xmlhttprequest'],
    })

    const onFinishedHandler = (
      details:
        | Parameters<
            Parameters<
              typeof browser.webRequest.onBeforeRedirect['addListener']
            >[0]
          >[0]
        | Parameters<
            Parameters<typeof browser.webRequest.onCompleted['addListener']>[0]
          >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      })
      browser.webRequest.onBeforeRedirect.removeListener(onFinishedHandler)
      browser.webRequest.onCompleted.removeListener(onFinishedHandler)

      const statusLineComponents = details.statusLine.split(' ')
      const protocolVersion = statusLineComponents[0]
      const statusMessage = statusLineComponents.splice(2).join(' ')
      const headers = (details.responseHeaders ?? []).map(
        ({ name, value }) => ({
          name,
          value: value ?? '',
        }),
      )

      this.responseInfo = {
        protocolVersion,
        statusCode: details.statusCode,
        statusMessage,
        headers,
      }
    }
    browser.webRequest.onBeforeRedirect.addListener(
      onFinishedHandler,
      {
        urls: ['*://*/*'],
        types: ['xmlhttprequest'],
      },
      ['responseHeaders', 'extraHeaders'],
    )
    browser.webRequest.onCompleted.addListener(
      onFinishedHandler,
      {
        urls: ['*://*/*'],
        types: ['xmlhttprequest'],
      },
      ['responseHeaders', 'extraHeaders'],
    )

    const onErrorHandler = (
      details:
        | Parameters<
            Parameters<
              typeof browser.webRequest.onErrorOccurred['addListener']
            >[0]
          >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      })
      browser.webRequest.onErrorOccurred.removeListener(onErrorHandler)
    }
    browser.webRequest.onErrorOccurred.addListener(onErrorHandler, {
      urls: ['*://*/*'],
      types: ['xmlhttprequest'],
    })
  }

  async sendRequest() {
    const requestInit: RequestInit = {
      method: this.request.method,
      cache: 'no-store',
      credentials: 'omit',
      keepalive: false,
      referrerPolicy: 'no-referrer',
      ...(BodyAvailableMethods.includes(this.request.method)
        ? { body: this.request.body.content }
        : {}),
    }

    try {
      const response = await fetch(this.request.url, requestInit)
      let body = await response.text()

      const finalUrl = new URL(response.url)
      const isRedirected = isSelfOrigin(finalUrl)

      let contentLength = 0
      try {
        contentLength = parseInt(
          this.responseInfo.headers.find(
            ({ name }) => name.toLowerCase() === 'content-length',
          )?.value!,
        )
      } catch (_) {
        // ignored error
      } finally {
        if (isRedirected && contentLength > 0) {
          body =
            '[Content cannot be catched because it is a redirection response]'
        }
      }

      const result: DevtoolsExecuteMessage = {
        type: 'execute',
        data: {
          protocolVersion: this.responseInfo.protocolVersion,
          statusCode: this.responseInfo.statusCode,
          statusMessage: this.responseInfo.statusMessage,
          headers: this.responseInfo.headers,
          body,
        },
      }
      return result
    } catch (error) {
      const result: DevtoolsErrorMessage = {
        type: 'error',
        data: (error as Error).message,
      }

      return result
    }
  }
}
