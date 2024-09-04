import CryptoJS from 'crypto-js'

window.Encode = {}

window.Encode.URL = {
  encode: value => {
    return encodeURIComponent(value)
  },
  encodeAllCharacters: value => {
    return window.Encode.Hexadecimal.encode(value).replace(
      /.{2}/g,
      str => `%${str}`,
    )
  },
  decode: value => {
    return decodeURIComponent(value)
  },
  decodePlusAsSpace: value => {
    return decodeURIComponent(value.replaceAll('+', ' '))
  },
}

window.Encode.Base64 = {
  encode: value => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value))
  },

  decode: value => {
    const wordArray = CryptoJS.enc.Base64.parse(value)

    let result = null
    try {
      result = CryptoJS.enc.Utf8.stringify(wordArray)
    } catch (error) {
      result = CryptoJS.enc.Latin1.stringify(wordArray)
    }

    return result
  },
}

window.Encode.Hexadecimal = {
  encode: value => {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(value))
  },

  decode: value => {
    const wordArray = CryptoJS.enc.Hex.parse(value)

    let result = null
    try {
      result = CryptoJS.enc.Utf8.stringify(wordArray)
    } catch (error) {
      result = CryptoJS.enc.Latin1.stringify(wordArray)
    }

    return result
  },
}

window.Encode.Unicode = {
  encode: value => {
    return value.replace(/./gs, char => {
      return '\\u' + ('000' + char.charCodeAt().toString(16)).slice(-4)
    })
  },

  decode: value => {
    return value.replace(/\\u.{4}/g, str => {
      return String.fromCharCode(parseInt(str.substring(2, 6), 16))
    })
  },
}

window.Encode.Html = {
  encode2Hex: value => {
    return value.replace(/./gs, char => {
      return `&#x${char.charCodeAt().toString(16)};`
    })
  },

  encode2Dec: value => {
    return value.replace(/./gs, char => {
      return `&#${char.charCodeAt().toString()};`
    })
  },

  encode2EntityName: value => {
    const entities = [
      ['&', '&amp;'],
      ["'", '&apos;'],
      ['<', '&lt;'],
      ['>', '&gt;'],
      [' ', '&nbsp;'],
      ['"', '&quot;'],
    ]
    entities.forEach(e => {
      const [k, v] = e
      value = value.replaceAll(k, v)
    })
    return value
  },

  decodeFromHex: value => {
    return value.replace(/&#x[0-9a-fA-F]{1,2};/g, str => {
      return String.fromCharCode(parseInt(str.substring(3), 16))
    })
  },

  decodeFromDec: value => {
    return value.replace(/&#\d{1,3};/g, str => {
      return String.fromCharCode(parseInt(str.substring(2)))
    })
  },

  decodeFromEntityName: value => {
    const entities = [
      [/&amp;/g, '&'],
      [/&apos;/g, "'"],
      [/&lt;/g, '<'],
      [/&gt;/g, '>'],
      [/&nbsp;/g, ' '],
      [/&quot;/g, '"'],
    ]
    entities.forEach(e => {
      const [k, v] = e
      value = value.replace(k, v)
    })
    return value
  },
}

window.Encode.CharCode = {
  encode: value => {
    return (
      'String.fromCharCode(' +
      [...value]
        .map(c => {
          return c.charCodeAt()
        })
        .join(',') +
      ')'
    )
  },

  decode: value => {
    return value
      .substring(20, value.length - 1)
      .split(',')
      .map(charCode => {
        return String.fromCharCode(charCode)
      })
      .join('')
  },
}

window.Encode.AtobHelper = {
  encode: value => `atob('${btoa(value)}')`,
}

window.Encode.Escape = {
  hex: value => {
    return [...value]
      .map(c =>
        c.charCodeAt() > 0xff ? c : '\\x' + c.charCodeAt().toString(16),
      )
      .join('')
  },

  oct: value => {
    return [...value]
      .map(c => (c.charCodeAt() > 0xff ? c : '\\' + c.charCodeAt().toString(8)))
      .join('')
  },
}
