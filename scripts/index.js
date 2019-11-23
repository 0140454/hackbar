chrome.storage.local.get({
  darkThemeEnabled: false
}, ({ darkThemeEnabled }) => {
  new Vue({
    el: '#app',
    vuetify: new Vuetify({
      theme: {
        dark: darkThemeEnabled
      }
    }),
    data: {
    /* DOM element */
      domFocusedInput: null,
      /* Chrome */
      backgroundPageConnection: null,
      /* Dialog */
      reloadDialog: false,
      sqlInjectionDialog: {
        show: false,
        valid: true,
        positionRequired: true,
        func: '',
        columns: '1',
        position: '1'
      },
      testProgressDialog: {
        show: false,
        percentage: null,
        status: null,
        error: null,
        result: null
      },
      /* Error handling */
      snackbar: {
        show: false,
        text: ''
      },
      /* HTTP Request */
      request: {
        url: '',
        body: {
          content: '',
          enctype: 'application/x-www-form-urlencoded',
          enabled: false
        },
        headers: []
      }
    },
    created: function () {
      this.redrawScrollbar()

      this.backgroundPageConnection = chrome.runtime.connect()
      this.backgroundPageConnection.onMessage.addListener(this.handleMessage)
      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'init'
      })

      chrome.storage.onChanged.addListener(changes => {
        this.$vuetify.theme.dark = changes.darkThemeEnabled.newValue
        this.redrawScrollbar()
      })
    },
    methods: {
      load: function () {
        this.backgroundPageConnection.postMessage({
          tabId: chrome.devtools.inspectedWindow.tabId,
          type: 'load'
        })
      },

      split: function () {
        this.request.url = this.request.url.replace(/[^\n][?&#]/g, str => {
          return str[0] + '\n' + str[1]
        })

        if (typeof this.request.body.content !== 'undefined' &&
          this.request.body.enctype !== 'multipart/form-data') {
          this.request.body.content = this.request.body.content.replace(
            /[^\n][?&#]/g, str => {
              return str[0] + '\n' + str[1]
            })
        }
      },

      execute: function () {
        if (this.request.url.length === 0) {
          return
        }

        this.backgroundPageConnection.postMessage({
          tabId: chrome.devtools.inspectedWindow.tabId,
          type: 'execute',
          data: this.request
        })
      },

      controlTest: function (action, script = undefined, argument = undefined) {
        if (action === 'start') {
          this.testProgressDialog.percentage = null
          this.testProgressDialog.status = null
          this.testProgressDialog.result = null
          this.testProgressDialog.error = null
          this.testProgressDialog.show = true
        }

        this.backgroundPageConnection.postMessage({
          tabId: chrome.devtools.inspectedWindow.tabId,
          type: 'test',
          data: { action, script, argument }
        })
      },

      addHeader: function () {
        this.request.headers.unshift({
          enabled: true,
          name: '',
          value: ''
        })
      },

      deleteHeader: function (index) {
        this.request.headers.splice(index, 1)
      },

      enableDarkTheme: function (enabled) {
        chrome.storage.local.set({
          darkThemeEnabled: enabled
        })
      },

      redrawScrollbar: function () {
        document.documentElement.className = this.$vuetify.theme.dark
          ? 'theme--dark'
          : 'theme--light'
        /* force to redraw scrollbar */
        document.documentElement.style.overflowY = 'hidden'
        document.documentElement.clientHeight.toString()
        document.documentElement.style.overflowY = 'scroll'
      },

      getNamespaceByPath: function (path, root, returnName) {
        let namespace = (typeof root === 'undefined') ? window : root

        path = path.split('.')
        for (let idx = 0; idx < path.length - 1; idx++) {
          if (typeof namespace[path[idx]] !== 'undefined') {
            namespace = namespace[path[idx]]
          } else {
            return undefined
          }
        }

        if (returnName === true) {
          return {
            namespace: namespace,
            name: path.pop()
          }
        } else {
          return namespace
        }
      },

      applyFunction: function (func, insertWhenNoSelection = false, argument = undefined) {
        func = this.getNamespaceByPath(func, window, true)

        if (this.domFocusedInput === null) {
          return
        }

        let startIndex = this.domFocusedInput.selectionStart
        let endIndex = this.domFocusedInput.selectionEnd
        const textSelected = (endIndex - startIndex !== 0)
        const inputText = this.domFocusedInput.value

        if (typeof argument === 'undefined') {
          if (textSelected === true) {
            argument = inputText.substring(startIndex, endIndex)
          } else if (insertWhenNoSelection === true) {
            argument = ''
          } else {
            argument = inputText
          }
        }

        let processed = argument
        try {
          processed = func.namespace[func.name](argument)
        } catch (error) {
          this.snackbar.text = error.message
          this.snackbar.show = true
        }

        this.$nextTick(() => {
          this.domFocusedInput.focus()
          if (textSelected !== true && insertWhenNoSelection !== true) {
            startIndex = 0
            endIndex = inputText.length

            document.execCommand('selectAll')
          }

          document.execCommand('insertText', false, processed)

          this.domFocusedInput.setSelectionRange(
            startIndex + ((textSelected === true) ? 0 : processed.length),
            startIndex + processed.length)
        })
      },

      sqlInjectionPrompt: function (func, positionRequired = true) {
        this.sqlInjectionDialog.func = func
        this.sqlInjectionDialog.show = true
        this.sqlInjectionDialog.positionRequired = positionRequired !== false
        this.$nextTick(this.$refs.sqlInjectionInput.focus)
      },

      onFocus: function (event) {
        this.domFocusedInput = event.target
      },

      handleMessage: function (message, sender, sendResponse) {
        if (message.type === 'load') {
          if (typeof message.data === 'undefined') {
            this.reloadDialog = true
            return
          }

          const request = message.data

          this.request.url = request.url
          this.request.body.enabled = (typeof request.body !== 'undefined')
          if (typeof request.contentType !== 'undefined') {
            this.request.body.enctype = request.contentType.split(';', 1)[0].trim()
          }

          if (this.request.body.enabled) {
            if (typeof request.body.formData !== 'undefined') {
              const params = new URLSearchParams()

              for (const name in request.body.formData) {
                request.body.formData[name].forEach(value => {
                  params.append(name, value)
                })
              }

              this.request.body.content = params.toString()
            } else {
              this.request.body.content = ''

              request.body.raw.forEach(data => {
                if (typeof data.file !== 'undefined') {
                  this.request.body.content += `[Content of '${data.file}']`
                } else {
                  this.request.body.content += data.bytes
                }
              })
            }
          }

          this.$refs.url.focus()
        } else if (message.type === 'command') {
          switch (message.data) {
            case 'load_url':
              this.load()
              break
            case 'split_url':
              this.split()
              break
            case 'execute_url':
              this.execute()
              break
          }
        } else if (message.type === 'error') {
          this.snackbar.text = message.data
          this.snackbar.show = true
        } else if (message.type === 'test') {
          const report = message.data

          switch (report.type) {
            case 'progress':
              this.testProgressDialog.status = report.data.status ||
                                               this.testProgressDialog.status
              this.testProgressDialog.percentage = report.data.percentage ||
                                                   this.testProgressDialog.percentage
              break
            case 'finished':
              if (this.testProgressDialog.error === null) {
                this.testProgressDialog.status = 'Finished'
              } else if (this.testProgressDialog.status !== null) {
                this.testProgressDialog.status += ` (${this.testProgressDialog.error})`
              } else {
                this.testProgressDialog.status = this.testProgressDialog.error
              }
              this.testProgressDialog.result = report.data
              break
            case 'error':
              this.testProgressDialog.error = report.data
              this.snackbar.text = report.data
              this.snackbar.show = true
              break
          }
        }
      },

      supportedEnctype: function () {
        return [
          'application/x-www-form-urlencoded',
          'multipart/form-data',
          'application/json'
        ]
      },

      commonRequestHeaders: function () {
        return [
          'Accept',
          'Accept-Charset',
          'Accept-Datetime',
          'Accept-Encoding',
          'Accept-Language',
          'Access-Control-Request-Headers',
          'Access-Control-Request-Method',
          'A-IM',
          'Authorization',
          'Cache-Control',
          'Connection',
          'Content-Length',
          'Content-MD5',
          'Content-Type',
          'Cookie',
          'Date',
          'DNT',
          'Expect',
          'Forwarded',
          'From',
          'Front-End-Https',
          'Host',
          'HTTP2-Settings',
          'If-Match',
          'If-Modified-Since',
          'If-None-Match',
          'If-Range',
          'If-Unmodified-Since',
          'Max-Forwards',
          'Origin',
          'Pragma',
          'Proxy-Authorization',
          'Proxy-Connection',
          'Range',
          'Referer',
          'Save-Data',
          'TE',
          'Upgrade',
          'Upgrade-Insecure-Requests',
          'User-Agent',
          'Via',
          'Warning',
          'X-ATT-DeviceId',
          'X-Correlation-ID',
          'X-Csrf-Token',
          'X-Forwarded-For',
          'X-Forwarded-Host',
          'X-Forwarded-Proto',
          'X-Http-Method-Override',
          'X-Requested-With',
          'X-Request-ID',
          'X-UIDH',
          'X-Wap-Profile'
        ]
      }
    }
  })
})
