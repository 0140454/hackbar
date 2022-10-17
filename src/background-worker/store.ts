import browser from 'webextension-polyfill'

type RuntimePort = Omit<browser.Runtime.Port, 'postMessage'> & {
  postMessage(
    message:
      | DevtoolsLoadMessage
      | DevtoolsExecuteMessage
      | DevtoolsTestMessage
      | DevtoolsCommandMessage
      | DevtoolsErrorMessage,
  ): void
}

class Store {
  #records: Record<
    number,
    {
      connection?: RuntimePort
      request?: BrowseRequest
      _updatedAt: number
    }
  >
  #ruleId: number
  #encoder: TextEncoder

  constructor() {
    this.#records = {}
    this.#ruleId = 1
    this.#encoder = new TextEncoder()
    this.#load()
  }

  allocateRuleId() {
    const result = this.#ruleId++

    this.#sync()
    return result
  }

  updateConnection(tabId: number, connection: RuntimePort) {
    const tabData = this.#records[tabId] || {}

    tabData.connection = connection
    tabData._updatedAt = Date.now()
    this.#records[tabId] = tabData
  }

  getConnection(tabId: number) {
    return this.#records[tabId]?.connection
  }

  updateBrowseRequest(tabId: number, request: BrowseRequest | undefined) {
    const tabData = this.#records[tabId] || {}

    tabData.request = request
    tabData._updatedAt = Date.now()
    this.#records[tabId] = tabData

    this.#sync()
  }

  getBrowseRequest(tabId: number) {
    return this.#records[tabId]?.request
  }

  remove(tabId: number) {
    delete this.#records[tabId]

    this.#sync()
  }

  async #sync() {
    const sortedRecords = Object.entries(this.#records)
      .filter(([_, tabData]) => tabData.request)
      .sort(
        ([_tabIdA, tabDataA], [_tabIdB, tabDataB]) =>
          tabDataA._updatedAt - tabDataB._updatedAt,
      )

    let data = {}
    while (sortedRecords.length) {
      data = {
        ruleId: this.#ruleId,
        records: sortedRecords.reduce((result, [tabId, tabData]) => {
          result[tabId] = tabData.request!

          return result
        }, {} as Record<string, BrowseRequest>),
      }

      const length = this.#encoder.encode(JSON.stringify(data)).length
      if (length > browser.storage.session.QUOTA_BYTES) {
        sortedRecords.shift()
      } else {
        break
      }
    }

    await browser.storage.session.clear()
    await browser.storage.session.set(data)
  }

  async #load() {
    const data = (await browser.storage.session.get()) as {
      ruleId: number
      records: Record<number, BrowseRequest>
    }

    const records = data.records
    for (const tabId in records) {
      this.#records[parseInt(tabId)] = {
        request: records[tabId],
        _updatedAt: Date.now(),
      }
    }

    this.#ruleId = data.ruleId || this.#ruleId
  }
}

const store = new Store()

export default store
