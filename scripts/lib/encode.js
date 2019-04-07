var Encode = {}

Encode.URL = class {
  static encode (value) {
    return encodeURIComponent(value)
  }

  static decode (value) {
    return decodeURIComponent(value)
  }
}

Encode.Base64 = class {
  static encode (value) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value))
  }

  static decode (value) {
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

Encode.Hexadecimal = class {
  static encode (value) {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(value))
  }

  static decode (value) {
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

Encode.Unicode = class {
  static encode (value) {
    return value.replace(/./gs, function (char) {
      return '\\u' + ('000' + char.charCodeAt().toString(16)).slice(-4)
    })
  }

  static decode (value) {
    return value.replace(/\\u.{4}/g, function (str) {
      return String.fromCharCode(parseInt(str.substring(2, 6), 16))
    })
  }
}

Encode.Html = class {
  static encode (value) {
    return value.replace(/./gs, function (char) {
      return '&#x' + char.charCodeAt().toString(16) + ';'
    })
  }

  static decode (value) {
    return value.replace(/&#x.{1,2};/g, function (str) {
      return String.fromCharCode(parseInt(str.substring(3, str.length - 1), 16))
    })
  }
}

Encode.CharCode = class {
  static encode (value) {
    return 'String.fromCharCode(' + value.split('').map(function (char) {
      return char.charCodeAt()
    }).join(',') + ')'
  }

  static decode (value) {
    return value.substring(20, value.length - 1).split(',').map(
      function (charCode) {
        return String.fromCharCode(charCode)
      }).join('')
  }
}
