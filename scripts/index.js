new Vue({
  el: '#app',
  data: {
    /* DOM element */
    domFocusedInput: null,
    /* Chrome */
    backgroundPageConnection: null,
    /* Dialog */
    reloadDialog: false,
    promptDialog: {
      show: false,
      valid: false,
      func: '',
      value: ''
    },
    /* HTTP Request */
    request: {
      url: '',
      body: {
        content: '',
        enabled: false
      },
      headers: []
    }
  },
  created: function () {
    this.backgroundPageConnection = chrome.runtime.connect({ name: 'hack-bar' })
    this.backgroundPageConnection.onMessage.addListener(this.handleMessage)
    this.backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: 'init'
    })
  },
  methods: {
    loadUrl: function () {
      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'load'
      })
    },

    splitUrl: function () {
      this.request.url = this.request.url.replace(/[^\n][?&#]/g,
        function (str) {
          return str[0] + '\n' + str[1]
        })

      if (typeof this.request.body.content !== 'undefined') {
        this.request.body.content = this.request.body.content.replace(
          /[^\n][?&#]/g, function (str) {
            return str[0] + '\n' + str[1]
          })
      }
    },

    executeUrl: function () {
      if (this.request.url.length === 0) {
        return
      }

      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'execute',
        data: this.request
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

    getNamespaceByPath: function (path, root, returnName) {
      let namespace = (typeof root === 'undefined') ? window : root

      path = path.split('.')
      for (let i = 0; i < path.length - 1; i++) {
        if (typeof namespace[path[i]] !== 'undefined') {
          namespace = namespace[path[i]]
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

    applyFunction: function (func, insertWhenNoSelection, argument) {
      func = this.getNamespaceByPath(func, window, true)

      if (this.domFocusedInput === null) {
        return
      }

      let startIndex = this.domFocusedInput.selectionStart
      let endIndex = this.domFocusedInput.selectionEnd
      const textSelected = endIndex - startIndex !== 0
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

      let processed = func.namespace[func.name](argument)

      if (textSelected !== true && insertWhenNoSelection !== true) {
        startIndex = 0
        endIndex = inputText.length
      }

      this.changeInputValue(inputText.substring(0, startIndex) + processed +
        inputText.substring(endIndex))
      this.refocusInput(
        startIndex + ((textSelected === true) ? 0 : processed.length),
        startIndex + processed.length)
    },

    promptThenApplyFunction: function (func) {
      this.promptDialog.value = '1'
      this.promptDialog.valid = true
      this.promptDialog.func = func
      this.promptDialog.show = true
      this.$nextTick(this.$refs.promptInput.focus)
    },

    onFocus: function (event) {
      this.domFocusedInput = event.target
    },

    refocusInput: function (startIndex, endIndex) {
      this.domFocusedInput.setSelectionRange(startIndex, endIndex)
      this.domFocusedInput.focus()
    },

    changeInputValue: function (value) {
      const event = new Event('input', { bubbles: true })
      this.domFocusedInput.value = value
      this.domFocusedInput.dispatchEvent(event)
    },

    handleMessage: function (message, sender, sendResponse) {
      if (message.type === 'load') {
        if (typeof message.data === 'undefined') {
          this.reloadDialog = true
          return
        }

        const request = message.data

        this.request.url = request.url
        this.request.body.content = request.body
        this.request.body.enabled = (typeof request.body !== 'undefined')

        if (this.request.body.enabled) {
          const params = new URLSearchParams()

          for (const name in request.body) {
            this.request.body.content[name].forEach(function (value) {
              params.append(name, value)
            })
          }

          this.request.body.content = params.toString()
        }

        this.$refs.url.focus()
      } else if (message.type === 'command') {
        switch (message.data) {
          case 'load_url':
            this.loadUrl()
            break
          case 'split_url':
            this.splitUrl()
            break
          case 'execute_url':
            this.executeUrl()
            break
        }
      }
    }
  }
})
