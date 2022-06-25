class Store {
  #records: Record<
    number,
    {
      connection?: chrome.runtime.Port
      request?: BrowseRequest
      _updatedAt: number
    }
  >
  #encoder: TextEncoder

  constructor() {
    this.#records = {}
    this.#encoder = new TextEncoder()
    this.#load()
  }

  updateConnection(tabId: number, connection: chrome.runtime.Port) {
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
    const data = Object.entries(this.#records)
      .filter(([_, tabData]) => tabData.request)
      .sort(
        ([_tabIdA, tabDataA], [_tabIdB, tabDataB]) =>
          tabDataA._updatedAt - tabDataB._updatedAt,
      )

    let pairs = {}
    while (data.length) {
      pairs = data.reduce((result, [tabId, tabData]) => {
        result[tabId] = tabData.request!

        return result
      }, {} as Record<string, BrowseRequest>)

      const length = this.#encoder.encode(JSON.stringify(pairs)).length
      if (length > chrome.storage.session.QUOTA_BYTES) {
        data.shift()
      } else {
        break
      }
    }

    await chrome.storage.session.clear()
    await chrome.storage.session.set(pairs)
  }

  async #load() {
    const data: Record<string, BrowseRequest> =
      await chrome.storage.session.get()

    for (const tabId in data) {
      this.#records[parseInt(tabId)] = {
        request: data[tabId],
        _updatedAt: Date.now(),
      }
    }
  }
}

export default new Store()
