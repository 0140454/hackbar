import browser from 'webextension-polyfill'
import {
  BodyAvailableMethods,
  DefaultSentRequestHeaders,
} from '../utils/constants'
import { isSelfOrigin, sleep } from '../utils/functions'
import { RequestExecutor } from './request-executor'

export class FetchRequestExecutor extends RequestExecutor {
  static STATUS_CODE_UNKNOWN = -1

  responseInfo: Omit<BrowseResponse, 'body'>

  constructor(tabId: number, request: BrowseRequest) {
    super(tabId, request)

    this.responseInfo = {
      protocolVersion: '',
      statusCode: FetchRequestExecutor.STATUS_CODE_UNKNOWN,
      statusMessage: '',
      baseUrl: '',
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
        _createdAt: 0,
      })
    })
  }

  getModifyHeaderCondition(): browser.DeclarativeNetRequest.RuleConditionType {
    return {
      initiatorDomains: [browser.runtime.id],
      resourceTypes: ['xmlhttprequest'],
    }
  }

  setupModifyHeaderRuleCleaner(ruleId: number) {
    const handler = async (
      details:
        | Parameters<
            Parameters<
              (typeof browser.webRequest.onSendHeaders)['addListener']
            >[0]
          >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      await browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      })

      browser.webRequest.onSendHeaders.removeListener(handler)
      browser.webRequest.onErrorOccurred.removeListener(handler)
    }

    browser.webRequest.onSendHeaders.addListener(handler, {
      urls: ['*://*/*'],
      types: ['xmlhttprequest'],
    })
    browser.webRequest.onErrorOccurred.addListener(handler, {
      urls: ['*://*/*'],
      types: ['xmlhttprequest'],
    })
  }

  async setupEventHandlers() {
    const updateResponseInfo = (
      details:
        | browser.WebRequest.OnBeforeRedirectDetailsType
        | browser.WebRequest.OnCompletedDetailsType,
    ) => {
      const statusLineComponents = details.statusLine.split(' ')
      const protocolVersion = statusLineComponents[0]
      const statusMessage = statusLineComponents.splice(2).join(' ')
      const baseUrl = new URL(details.url).origin
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
        baseUrl,
        headers,
      }
    }

    const onBeforeRedirectHandler = async (
      details:
        | Parameters<
            Parameters<
              (typeof browser.webRequest.onBeforeRedirect)['addListener']
            >[0]
          >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      browser.webRequest.onBeforeRedirect.removeListener(
        onBeforeRedirectHandler,
      )

      updateResponseInfo(details)
    }
    browser.webRequest.onBeforeRedirect.addListener(
      onBeforeRedirectHandler,
      {
        urls: ['*://*/*'],
        types: ['xmlhttprequest'],
      },
      ['responseHeaders', 'extraHeaders'],
    )

    const onCompletedHandler = async (
      details:
        | Parameters<
            Parameters<
              (typeof browser.webRequest.onCompleted)['addListener']
            >[0]
          >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      browser.webRequest.onBeforeRedirect.removeListener(
        onBeforeRedirectHandler,
      )
      browser.webRequest.onCompleted.removeListener(onCompletedHandler)

      updateResponseInfo(details)
    }
    browser.webRequest.onCompleted.addListener(
      onCompletedHandler,
      {
        urls: ['*://*/*'],
        types: ['xmlhttprequest'],
      },
      ['responseHeaders', 'extraHeaders'],
    )

    const onErrorOccurredHandler = async (
      details:
        | Parameters<
            Parameters<
              (typeof browser.webRequest.onErrorOccurred)['addListener']
            >[0]
          >[0],
    ) => {
      if (!isSelfOrigin(details.initiator)) {
        return
      }

      browser.webRequest.onBeforeRedirect.removeListener(
        onBeforeRedirectHandler,
      )
      browser.webRequest.onCompleted.removeListener(onCompletedHandler)
      browser.webRequest.onErrorOccurred.removeListener(onErrorOccurredHandler)

      if (
        this.responseInfo.statusCode ===
        FetchRequestExecutor.STATUS_CODE_UNKNOWN
      ) {
        this.responseInfo.statusCode = 0
      }
    }
    browser.webRequest.onErrorOccurred.addListener(onErrorOccurredHandler, {
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
      redirect: this.request.followRedirect ? 'follow' : 'manual',
      referrerPolicy: 'no-referrer',
      ...(BodyAvailableMethods.includes(this.request.method)
        ? { body: this.request.body.content }
        : {}),
    }

    try {
      const response = await fetch(this.request.url, requestInit)
      let body = await response.text()

      await this.#waitResponseInfo()
      const isRedirected = Math.trunc(this.responseInfo.statusCode / 100) == 3

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
            '[Content cannot be recorded because it is a redirection response]'
        }
      }

      const result: DevtoolsExecuteMessage = {
        type: 'execute',
        data: {
          protocolVersion: this.responseInfo.protocolVersion,
          statusCode: this.responseInfo.statusCode,
          statusMessage: this.responseInfo.statusMessage,
          baseUrl: this.responseInfo.baseUrl,
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

  async #waitResponseInfo() {
    while (
      this.responseInfo.statusCode === FetchRequestExecutor.STATUS_CODE_UNKNOWN
    ) {
      await sleep(1)
    }
  }
}
