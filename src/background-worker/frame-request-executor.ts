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
        _createdAt: 0,
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
      await browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [ruleId],
      })

      browser.webRequest.onSendHeaders.removeListener(handler)
      browser.webRequest.onErrorOccurred.removeListener(handler)
    }

    browser.webRequest.onSendHeaders.addListener(handler, {
      urls: ['*://*/*'],
      types: ['main_frame'],
    })
    browser.webRequest.onErrorOccurred.addListener(handler, {
      urls: ['*://*/*'],
      types: ['main_frame'],
    })
  }

  async setupEventHandlers() {
    return
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
    } else {
      const result: DevtoolsExecuteMessage = {
        type: 'execute',
        data: undefined,
      }

      return result
    }
  }
}
