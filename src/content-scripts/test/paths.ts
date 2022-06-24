;(() => {
  /*
   * The following are about the messages sent from devtools.
   *   - Start the test
   *     {
   *       action: 'start',
   *       argument: ANY
   *     }
   *
   *   - Pause or Resume the test
   *     {
   *       action: 'toggle'
   *     }
   *
   *   - Stop the test
   *     {
   *       action: 'stop'
   *     }
   *
   * The following are the messages can be sent to devtools.
   *   - Progress
   *     {
   *       type: 'progress',
   *       data: {
   *         percentage: FLOAT,
   *         status: STRING
   *       }
   *     }
   *
   *   - Result (Must be implemented)
   *     {
   *       type: 'finished',
   *       data: {
   *         header: [
   *           { text: STRING(DISPLAY_NAME_1), value: STRING(VARIABLE_NAME_1) },
   *           { text: STRING(DISPLAY_NAME_2), value: STRING(VARIABLE_NAME_2) },
   *           ...
   *         ],
   *         data: [
   *           { VARIABLE_NAME_1: STRING(DATA_A_1), VARIABLE_NAME_2: STRING(DATA_A_2) },
   *           { VARIABLE_NAME_1: STRING(DATA_B_1), VARIABLE_NAME_2: STRING(DATA_B_2) },
   *           ...
   *         ]
   *       }
   *     }
   *
   *   - Error
   *     {
   *       type: 'error',
   *       data: STRING
   *     }
   */

  /* Constants */

  const STOPPED = 0
  const RUNNING = 1
  const PAUSED = 2

  const GETTING_NOT_FOUND_STATUS =
    'Getting status code for non-existent path...'

  /* Variables */

  const result: Array<TestResultData> = []
  const reporter = new (class {
    data: TestProgress
    timer: number

    constructor() {
      this.data = { status: '', percentage: 0 }
      this.timer = window.setInterval(() => this.flush(), 256)
    }

    setStatus(status: string) {
      this.data.status = status
    }

    setPercentage(percentage: number) {
      this.data.percentage = percentage
    }

    flush() {
      chrome.runtime.sendMessage({
        type: 'progress',
        data: this.data,
      } as DevtoolsTestMessage['data'])
    }

    stop() {
      window.clearInterval(this.timer)
    }
  })()

  let baseDirectory = '/'
  let state = RUNNING
  let controller: AbortController | null = null

  /* Helpers */

  const sleep = (ms: number) => {
    return new Promise(resolve => window.setTimeout(resolve, ms))
  }

  const wait = async () => {
    do {
      await sleep(50)
    } while (state === PAUSED)
  }

  const sendRequest = async (url: string, prompt?: string) => {
    let resp = null

    do {
      reporter.setStatus(prompt || url)

      try {
        resp = await fetch(url, {
          credentials: 'include',
          signal: controller!.signal,
        })
        break
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          if (state === PAUSED) {
            reporter.setStatus('Paused')

            await wait()
          } else if (state === STOPPED) {
            break
          }
        } else {
          throw error
        }
      }
    } while (state !== STOPPED)

    return resp
  }

  /* Functions */

  const generateNotFoundUrl = () => {
    const nonce = Math.floor(1 + Math.random() * 1000000)
    return `${window.origin}${baseDirectory}01234_${nonce}_cjtnd`
  }

  const generateTestUrl = (path: string) =>
    `${window.origin}${baseDirectory}${path}`

  const loadWordlist = async (url: string) => {
    const commonExtensions = ['asp', 'aspx', 'php', 'jsp']
    const resp = await fetch(url)
    const text = await resp.text()

    return text
      .replace(/(.*\.?)%EXT%/g, '$1' + commonExtensions.join('\n$1'))
      .split('\n')
  }

  const test = async (payloadsPath: string) => {
    const checkResponse = await sendRequest(
      generateNotFoundUrl(),
      GETTING_NOT_FOUND_STATUS,
    )
    if (checkResponse === null) {
      return
    }

    if ([403, 404].includes(checkResponse.status) === false) {
      throw new Error(
        `Unexpected status code ${checkResponse.status}, expected 403 or 404 when accessing non-existent path.`,
      )
    }

    const wordlist = await loadWordlist(payloadsPath)
    for (let idx = 0; idx < wordlist.length; ++idx) {
      reporter.setPercentage((idx / wordlist.length) * 100)

      const testUrl = generateTestUrl(wordlist[idx])
      const testResponse = await sendRequest(testUrl)
      if (testResponse === null) {
        break
      }

      if (testResponse.status !== checkResponse.status) {
        result.push({
          url: testUrl,
          code:
            testResponse.status +
            (testResponse.redirected ? ' (Redirected)' : ''),
        })
      }
    }
  }

  /* Message listener */

  const messageListener = async (message: TestRequest) => {
    if (message.action === 'start') {
      try {
        controller = new AbortController()
        if (message.argument.fromWebRoot === false) {
          baseDirectory =
            window.location.pathname.substring(
              0,
              window.location.pathname.lastIndexOf('/'),
            ) + '/'
        }

        await test(message.argument.payloadsPath)
      } catch (error) {
        reporter.flush()
        chrome.runtime.sendMessage({
          type: 'error',
          data: (error as Error).message,
        } as DevtoolsTestMessage['data'])
      } finally {
        chrome.runtime.sendMessage({
          type: 'finished',
          data: {
            header: [
              { text: 'URL', value: 'url' },
              { text: 'Code', value: 'code' },
            ],
            data: result,
          },
        } as DevtoolsTestMessage['data'])

        reporter.stop()
        chrome.runtime.onMessage.removeListener(
          messageListener as Parameters<
            Parameters<typeof chrome.runtime.onMessage['removeListener']>[0]
          >[0],
        )
      }
    } else if (message.action === 'toggle') {
      if (state === RUNNING) {
        state = PAUSED
        controller!.abort()
      } else if (state === PAUSED) {
        controller = new AbortController()
        state = RUNNING
      }
    } else if (message.action === 'stop') {
      state = STOPPED
      controller!.abort()
    }

    return undefined
  }

  chrome.runtime.onMessage.addListener(
    messageListener as Parameters<
      Parameters<typeof chrome.runtime.onMessage['removeListener']>[0]
    >[0],
  )
})()

export {}
