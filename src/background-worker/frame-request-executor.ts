import browser from 'webextension-polyfill'
import bodyProcessors from '../processors'
import { BodyAvailableMethods } from '../utils/constants'
import { RequestExecutor } from './request-executor'

export class FrameRequestExecutor extends RequestExecutor {
  setupAdditionalHeaders() {
    if (!BodyAvailableMethods.includes(this.request.method)) {
      return
    }

    const processor = bodyProcessors.find(this.request.body.enctype)
    if (!processor) {
      throw new Error('Unsupported enctype')
    }

    if (processor.getFormEnctype() != processor.getHttpContentType()) {
      this.request.headers.push({
        enabled: true,
        name: 'content-type',
        value: processor.getHttpContentType(),
        removeIfEmptyValue: false,
        _createdAt: 0, // Useless in background
      })
    }
  }

  getModifyHeaderCondition(): browser.DeclarativeNetRequest.RuleCondition {
    return {
      tabIds: [this.tabId],
      resourceTypes: ['main_frame'],
    }
  }

  setupModifyHeaderRuleCleaner(ruleId: number) {
    const handler = async () => {
      browser.webRequest.onBeforeRedirect.removeListener(handler)
      browser.webRequest.onCompleted.removeListener(handler)
      browser.webRequest.onErrorOccurred.removeListener(handler)

      await browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      })
    }

    browser.webRequest.onBeforeRedirect.addListener(handler, {
      urls: ['*://*/*'],
      types: ['main_frame'],
    })
    browser.webRequest.onCompleted.addListener(handler, {
      urls: ['*://*/*'],
      types: ['main_frame'],
    })
    browser.webRequest.onErrorOccurred.addListener(handler, {
      urls: ['*://*/*'],
      types: ['main_frame'],
    })
  }

  async setupEventHandlers() {
    return undefined
  }

  async sendRequest() {
    let error: string | null = null

    if (BodyAvailableMethods.includes(this.request.method)) {
      await browser.scripting.executeScript({
        target: {
          tabId: this.tabId,
        },
        files: ['core/post.js'],
      })

      error = await browser.tabs.sendMessage(this.tabId, this.request)
    } else {
      await browser.tabs.update(this.tabId, {
        url: this.request.url,
      })
    }

    if (error !== null) {
      const result: DevtoolsErrorMessage = {
        type: 'error',
        data: error,
      }

      return result
    }
  }
}
