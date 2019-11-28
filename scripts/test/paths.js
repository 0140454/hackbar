(() => {
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

  const GETTING_NOT_FOUND_STATUS = 'Getting status code for non-existent path...'

  /* Variables */

  const result = []
  const reporter = new class {
    constructor () {
      this.data = { status: null, percentage: null }
      this.timer = setInterval(() => {
        chrome.runtime.sendMessage({
          type: 'progress',
          data: this.data
        })
      }, 256)
    }

    setStatus (status) {
      this.data.status = status
    }

    setPercentage (percentage) {
      this.data.percentage = percentage
    }

    stop () {
      clearInterval(this.timer)
    }
  }()

  let baseDirectory = '/'
  let state = RUNNING
  let controller = null

  /* Helpers */

  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const wait = async () => {
    do {
      await sleep(50)
    } while (state === PAUSED)
  }

  const sendRequest = async (url, prompt = undefined) => {
    let resp = null

    do {
      reporter.setStatus(prompt || url)

      try {
        resp = await fetch(url, {
          credentials: 'include',
          signal: controller.signal
        })
        break
      } catch (error) {
        if (error.name === 'AbortError') {
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

  const generateTestUrl = path => `${window.origin}${baseDirectory}${path}`

  const loadWordlist = async url => {
    const commonExtensions = ['asp', 'aspx', 'php', 'jsp']
    const resp = await fetch(url)
    const text = await resp.text()

    return text.replace(/(.*\.?)%EXT%/g, '$1' +
      commonExtensions.join('\n$1')).split('\n')
  }

  const test = async wordlist => {
    const checkResponse = await sendRequest(
      generateNotFoundUrl(), GETTING_NOT_FOUND_STATUS)
    if (checkResponse === null) {
      return
    }

    if ([403, 404].includes(checkResponse.status) === false) {
      throw new Error(`Unexpected status code ${checkResponse.status}, expected 403 or 404 when accessing non-existent path.`)
    }

    wordlist = await loadWordlist(wordlist)
    for (const idx in wordlist) {
      reporter.setPercentage(idx / wordlist.length * 100)

      const testUrl = generateTestUrl(wordlist[idx])
      const testResponse = await sendRequest(testUrl)
      if (testResponse === null) {
        break
      }

      if (testResponse.status !== checkResponse.status) {
        result.push({
          url: testUrl,
          code: testResponse.status + (testResponse.redirected ? ' (Redirected)' : '')
        })
      }
    }
  }

  /* Message listener */

  const messageListener = async (message, sender, sendResponse) => {
    if (message.action === 'start') {
      try {
        controller = new AbortController()
        if (message.argument.againstWebRoot === false) {
          baseDirectory = window.location.pathname.substr(
            0, window.location.pathname.lastIndexOf('/')) + '/'
        }

        await test(message.argument.payloadsPath)
      } catch (error) {
        chrome.runtime.sendMessage({
          type: 'error',
          data: error.message
        })
      } finally {
        chrome.runtime.sendMessage({
          type: 'finished',
          data: {
            header: [
              { text: 'URL', value: 'url' },
              { text: 'Code', value: 'code' }
            ],
            data: result
          }
        })

        reporter.stop()
        chrome.runtime.onMessage.removeListener(messageListener)
      }
    } else if (message.action === 'toggle') {
      if (state === RUNNING) {
        state = PAUSED
        controller.abort()
      } else if (state === PAUSED) {
        controller = new AbortController()
        state = RUNNING
      }
    } else if (message.action === 'stop') {
      state = STOPPED
      controller.abort()
    }
  }

  chrome.runtime.onMessage.addListener(messageListener)
})()
