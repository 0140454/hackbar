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
    return window.btoa(utf8.encode(value))
  }

  static decode (value) {
    return utf8.decode(window.atob(value))
  }
}

Encode.Hexadecimal = class {
  static encode (value) {
    return utf8.encode(value).replace(/./g, function (char) {
      return ('0' + char.charCodeAt().toString(16)).slice(-2)
    })
  }

  static decode (value) {
    return utf8.decode(value.replace(/.{2}/g, function (str) {
      return String.fromCharCode(parseInt(str, 16))
    }))
  }
}

Encode.Unicode = class {
  static encode (value) {
    return value.replace(/./g, function (char) {
      return '\\u' + ('000' + char.charCodeAt().toString(16)).slice(-4)
    })
  }

  static decode (value) {
    return value.replace(/\\u.{4}/g, function (str) {
      return String.fromCharCode(parseInt(str.substring(2, 6), 16))
    })
  }
}
