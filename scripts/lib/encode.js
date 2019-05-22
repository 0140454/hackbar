window.Encode = {}

window.Encode.URL = {
  encode: (value) => {
    return encodeURIComponent(value)
  },

  decode: (value) => {
    return decodeURIComponent(value)
  }
}

window.Encode.Base64 = {
  encode: (value) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value))
  },

  decode: (value) => {
    const wordArray = CryptoJS.enc.Base64.parse(value)

    let result = null
    try {
      result = CryptoJS.enc.Utf8.stringify(wordArray)
    } catch (error) {
      result = CryptoJS.enc.Latin1.stringify(wordArray)
    }

    return result
  }
}

window.Encode.Hexadecimal = {
  encode: (value) => {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(value))
  },

  decode: (value) => {
    const wordArray = CryptoJS.enc.Hex.parse(value)

    let result = null
    try {
      result = CryptoJS.enc.Utf8.stringify(wordArray)
    } catch (error) {
      result = CryptoJS.enc.Latin1.stringify(wordArray)
    }

    return result
  }
}

window.Encode.Unicode = {
  encode: (value) => {
    return value.replace(/./gs, function (char) {
      return '\\u' + ('000' + char.charCodeAt().toString(16)).slice(-4)
    })
  },

  decode: (value) => {
    return value.replace(/\\u.{4}/g, function (str) {
      return String.fromCharCode(parseInt(str.substring(2, 6), 16))
    })
  }
}

window.Encode.Html = {
  encode: (value) => {
    return value.replace(/./gs, function (char) {
      return '&#x' + char.charCodeAt().toString(16) + ';'
    })
  },

  decode: (value) => {
    return value.replace(/&#x.{1,2};/g, function (str) {
      return String.fromCharCode(parseInt(str.substring(3, str.length - 1), 16))
    })
  }
}

window.Encode.CharCode = {
  encode: (value) => {
    return 'String.fromCharCode(' + value.split('').map(function (char) {
      return char.charCodeAt()
    }).join(',') + ')'
  },

  decode: (value) => {
    return value.substring(20, value.length - 1).split(',').map(
      function (charCode) {
        return String.fromCharCode(charCode)
      }).join('')
  }
}
