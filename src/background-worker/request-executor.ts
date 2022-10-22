import cloneDeep from 'lodash/cloneDeep'
import browser from 'webextension-polyfill'
import store from './store'

export abstract class RequestExecutor {
  tabId: number
  request: BrowseRequest

  constructor(tabId: number, request: BrowseRequest) {
    this.tabId = tabId
    this.request = cloneDeep(request)

    this.setupAdditionalHeaders()
    this.request.headers = this.request.headers.filter(
      header => header.enabled && header.name.length > 0,
    )
  }

  async execute() {
    const ruleId = await this.setupModifyHeaderRules()
    this.setupModifyHeaderRuleCleaner(ruleId)

    await this.setupEventHandlers()

    return await this.sendRequest()
  }

  abstract setupAdditionalHeaders(): void

  abstract getModifyHeaderCondition(): browser.DeclarativeNetRequest.RuleCondition

  getModifyHeaderInfo() {
    return this.request.headers.map(
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
  }

  async setupModifyHeaderRules() {
    const ruleId = store.allocateRuleId()
    const modifyHeaderInfo = this.getModifyHeaderInfo()
    const modifyHeaderCondition = this.getModifyHeaderCondition()
    const ruleOptions: browser.DeclarativeNetRequest.UpdateRuleOptions = {
      removeRuleIds: [ruleId],
    }

    if (modifyHeaderInfo.length > 0) {
      ruleOptions['addRules'] = [
        {
          id: ruleId,
          priority: 9999,
          action: {
            type: 'modifyHeaders',
            requestHeaders: modifyHeaderInfo,
          },
          condition: modifyHeaderCondition,
        },
      ]
    }

    await browser.declarativeNetRequest.updateSessionRules(ruleOptions)
    return ruleId
  }

  abstract setupModifyHeaderRuleCleaner(ruleId: number): void

  abstract setupEventHandlers(): Promise<void>

  abstract sendRequest(): Promise<DevtoolsExecuteMessage | DevtoolsErrorMessage>
}
