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

app.directive('mdFuncButton', function ($mdCompiler) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '<div ng-transclude></div>',
    link: function ($scope, elements, attrs) {
      $mdCompiler.compile({
        template: `<md-button ng-click='executeButtonFunction($event.target)'
                    func='${attrs.func}'>${elements[0].innerHTML}</md-button>`
      }).then(function (compileData) {
        compileData.link($scope)
        elements.replaceWith(compileData.element)
      })
    }
  }
})

app.controller('HackBarCtrl', function ($scope, $mdDialog) {
  $scope.backgroundPageConnection = chrome.runtime.connect({ name: 'hack-bar' })
  $scope.focusedInput = null

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
                        ' required to allow HackBar intercept the requests.',
          ok: 'Close'
        })

        $mdDialog.show(alertDialog)
        return
      }

      const request = message.data

      $scope.request.url = request.url
      $scope.request.body.content = request.body
      $scope.request.body.enabled = typeof request.body !== 'undefined'

      if ($scope.request.body.enabled) {
        const params = new URLSearchParams()

        for (const name in request.body) {
          request.body[name].forEach(function (value) {
            params.append(name, value)
          })
        }

        $scope.request.body.content = params.toString()
      }

      $scope.domUrl.focus()
    }
  }

  $scope.executeFunction = function (func, parameter) {
    let funcClass = window
    const funcPath = func.split('.')

    for (let i = 0; i < funcPath.length - 1; i++) {
      if (typeof funcClass[funcPath[i]] !== 'undefined') {
        funcClass = funcClass[funcPath[i]]
      } else {
        return undefined
      }
    }

    return funcClass[funcPath.slice(-1)](parameter)
  }

  $scope.executeButtonFunction = function (element) {
    if ($scope.focusedInput === null) {
      return
    }

    const startIndex = $scope.focusedInput.selectionStart
    const endIndex = $scope.focusedInput.selectionEnd

    let inputText = ($scope.focusedInput === $scope.domUrl)
      ? $scope.request.url : $scope.request.body.content
    let selectedText = inputText.substring(startIndex, endIndex)

    if (selectedText.length === 0) {
      return
    }

    selectedText = $scope.executeFunction(element.attributes.func.value,
      selectedText)
    inputText = inputText.substring(0, startIndex) + selectedText +
      inputText.substring(endIndex)

    if ($scope.focusedInput === $scope.domUrl) {
      $scope.request.url = inputText
    } else {
      $scope.request.body.content = inputText
    }

    setTimeout(function () {
      $scope.focusedInput.setSelectionRange(startIndex,
        startIndex + selectedText.length)
      $scope.focusedInput.focus()
    }, 0)
  }

  this.onFocus = function (event) {
    $scope.focusedInput = event.target
  }

  this.addHeader = function () {
    $scope.request.headers.unshift({ enabled: true, name: '', value: '' })
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
    $scope.request.url = $scope.request.url.replace(/[^\n][?&#]/g, function (str) {
      return str[0] + '\n' + str[1]
    })
    $scope.request.body.content = $scope.request.body.content.replace(/[^\n][?&#]/g, function (str) {
      return str[0] + '\n' + str[1]
    })
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
