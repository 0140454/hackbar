const app = angular.module('HackBarApp', ['ngMaterial'])

app.directive('ngElementVariable', function () {
  return {
    restrict: 'A',
    replace: false,
    link: function ($scope, elements, attrs) {
      $scope[attrs.ngElementVariable] = elements[0]
    }
  }
})

app.controller('HackBarCtrl', function ($scope, $mdDialog) {
  $scope.backgroundPageConnection = chrome.runtime.connect({ name: 'hack-bar' })
  $scope.domFocusedInput = null

  $scope.request = {
    url: '',
    body: {
      content: '',
      enabled: false
    },
    headers: []
  }

  $scope.init = function () {
    $scope.backgroundPageConnection.onMessage.addListener($scope.handleMessage)
  }

  $scope.handleMessage = function (message, sender, sendResponse) {
    if (message.type === 'load') {
      if (typeof message.data === 'undefined') {
        const alertDialog = $mdDialog.alert({
          title: 'Unable to fetch request information',
          textContent: 'After installing extension, reloading the tab is' +
                        ' required to let HackBar record the requests.',
          ok: 'OK'
        })

        $mdDialog.show(alertDialog)
        return
      }

      const request = message.data

      $scope.request.url = request.url
      $scope.request.body.content = request.body
      $scope.request.body.enabled = (typeof request.body !== 'undefined')

      if ($scope.request.body.enabled) {
        const params = new URLSearchParams()

        Object.entries(request.body).forEach(function ([name, value]) {
          params.append(name, value)
        })

        $scope.request.body.content = params.toString()
      }

      $scope.domUrl.focus()
    }
  }

  this.getNamespaceByPath = function (path, root, returnName) {
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
  }

  this.executeFunction = function (func, param2) {
    func = this.getNamespaceByPath(func, window, true)

    if ($scope.domFocusedInput === null || typeof func === 'undefined') {
      return
    }

    const model = this.getNamespaceByPath(
      $scope.domFocusedInput.attributes['ng-model'].value,
      angular.element($scope.domFocusedInput).scope(), true)

    const startIndex = $scope.domFocusedInput.selectionStart
    const endIndex = $scope.domFocusedInput.selectionEnd
    const inputText = model.namespace[model.name]

    if (typeof param2 === 'string') {
      const promptDialog = $mdDialog.prompt({
        title: 'HackBar',
        textContent: param2,
        initialValue: 1,
        required: true,
        ok: 'OK',
        cancel: 'Cancel'
      })

      $mdDialog.show(promptDialog).then((result) => {
        result = func.namespace[func.name](result)
        model.namespace[model.name] = inputText.substring(0, startIndex) +
          result + inputText.substring(endIndex)

        this.refocusInput(startIndex + result.length,
          startIndex + result.length)
      }, () => {
        this.refocusInput(startIndex, endIndex)
      })
    } else {
      let selectedText = inputText.substring(startIndex, endIndex)

      if (param2 !== false && selectedText.length === 0) {
        return
      }

      selectedText = func.namespace[func.name](selectedText)
      model.namespace[model.name] = inputText.substring(0, startIndex) +
        selectedText + inputText.substring(endIndex)

      this.refocusInput(
        startIndex + ((param2 === false) ? selectedText.length : 0),
        startIndex + selectedText.length
      )
    }
  }

  this.onFocus = function (event) {
    $scope.domFocusedInput = event.target
  }

  this.refocusInput = function (startIndex, endIndex) {
    setTimeout(function () {
      $scope.domFocusedInput.setSelectionRange(startIndex, endIndex)
      $scope.domFocusedInput.focus()
    }, 0)
  }

  this.addHeader = function () {
    $scope.request.headers.unshift({
      enabled: true,
      name: '',
      value: ''
    })
  }

  this.deleteHeader = function (index) {
    $scope.request.headers.splice(index, 1)
  }

  this.loadUrl = function () {
    $scope.backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: 'load'
    })
  }

  this.splitUrl = function () {
    $scope.request.url = $scope.request.url.replace(/[^\n][?&#]/g,
      function (str) {
        return str[0] + '\n' + str[1]
      })

    if (typeof $scope.request.body.content !== 'undefined') {
      $scope.request.body.content = $scope.request.body.content.replace(
        /[^\n][?&#]/g, function (str) {
          return str[0] + '\n' + str[1]
        })
    }
  }

  this.executeUrl = function () {
    if ($scope.request.url.length === 0) {
      return
    }

    $scope.backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: 'execute',
      data: $scope.request
    })
  }

  $scope.init()
})
