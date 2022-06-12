<template>
<v-app>
  <v-app-bar app dense flat>
    <v-toolbar-items>
      <v-btn text @click="load()">Load</v-btn>
      <v-btn text @click="split()">Split</v-btn>
      <v-btn text @click="execute()">Execute</v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            Test
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>Common paths</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="testCommonPathsAgainstRoot()">
                <v-list-item-title>Against web root directory</v-list-item-title>
              </v-list-item>
              <v-list-item @click="testCommonPathsAgainstCurrent()">
                <v-list-item-title>Against current directory</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list>
      </v-menu>
      <v-divider inset vertical></v-divider>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            SQLi
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>MySQL</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpDatabases')">
                <v-list-item-title>Dump all database names</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpTables')">
                <v-list-item-title>Dump tables from database</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpColumns')">
                <v-list-item-title>Dump columns from database</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SQLi.MySQL.dumpCurrentQueries', true)">
                <v-list-item-title>Dump current queries payload</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SQLi.MySQL.dumpInOneShot', true)">
                <v-list-item-title>Dump in one shot payload</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.MySQL.unionSelect', false)">
                <v-list-item-title>Union select statement</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SQLi.MySQL.errorBased', true)">
                <v-list-item-title>Error-based injection statement</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>PostgreSQL</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpDatabases')">
                <v-list-item-title>Dump all database names</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpTables')">
                <v-list-item-title>Dump tables from database</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpColumns')">
                <v-list-item-title>Dump columns from database</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.PostgreSQL.unionSelect', false)">
                <v-list-item-title>Union select statement</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SQLi.PostgreSQL.errorBased', true)">
                <v-list-item-title>Error-based injection statement</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>SQLite</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.SQLite.dumpTables')">
                <v-list-item-title>Dump tables from database</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.SQLite.dumpColumns')">
                <v-list-item-title>Dump columns from database (also with table name)</v-list-item-title>
              </v-list-item>
              <v-list-item @click="sqlInjectionPrompt('Payload.SQLi.SQLite.unionSelect', false)">
                <v-list-item-title>Union select statement</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-list-item @click="applyFunction('Payload.SQLi.polyglot', true)">
            <v-list-item-title>Polyglot</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Payload.SQLi.spaceToComment')">
            <v-list-item-title>Space to Inline comment</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            XSS
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="applyFunction('Payload.XSS.polyglot', true)">
            <v-list-item-title>Polyglot</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>Vue.js XSS payloads</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.XSS.Vue.vue2Interpolation', true)">
                <v-list-item-title>Vue 2 - Interpolation</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.XSS.Vue.vue2Directive', true)">
                <v-list-item-title>Vue 2 - Directive</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.XSS.Vue.vue3Interpolation', true)">
                <v-list-item-title>Vue 3 - Interpolation</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.XSS.Vue.vue3DynamicComponent', true)">
                <v-list-item-title>Vue 3 - Dynamic Component</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-divider></v-divider>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>Angular.js XSS payloads for strict CSP</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.XSS.AngularJS.angularJS1_6WithPrototype$on', true)">
                <v-list-item-title>AngularJS >= 1.6 with Prototype Library</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.XSS.AngularJS.angularJSWith$event', true)">
                <v-list-item-title>AngularJS All Version (Chrome Only)</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-divider></v-divider>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>CTF Snippets</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.XSS.snippets.getSamesiteFlag', true)">
                <v-list-item-title>Get flag from '/flag'</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.XSS.snippets.getCookieFlag', true)">
                <v-list-item-title>Get flag from document.cookie</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.XSS.snippets.getStorageFlag', true)">
                <v-list-item-title>Get flag from localStorage.flag</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-divider></v-divider>
          <v-list-item @click="applyFunction('Encode.Html.encode2Hex')">
            <v-list-item-title>Html encode (by hex)</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Html.encode2Dec')">
            <v-list-item-title>Html encode (by dec)</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Html.encode2EntityName')">
            <v-list-item-title>Html encode (by entity name)</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Html.decodeFromHex')">
            <v-list-item-title>Html decode (by hex)</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Html.decodeFromDec')">
            <v-list-item-title>Html decode (by dec)</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Html.decodeFromEntityName')">
            <v-list-item-title>Html decode (by entity name)</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="applyFunction('Encode.CharCode.encode')">
            <v-list-item-title>String.fromCharCode encode</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.CharCode.decode')">
            <v-list-item-title>String.fromCharCode decode</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            LFI
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="applyFunction('Payload.LFI.phpWrapperBas64', true)">
            <v-list-item-title>PHP wrapper - Base64</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            SSTI
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>Jinja2 (Python)</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.tuple2AllSubclasses', true)">
                <v-list-item-title>Show subclasses with tuple</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.tuple2RCE', true)">
                <v-list-item-title>From Tuple to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.g2RCE', true)">
                <v-list-item-title>From Flask g to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.urlFor2RCE', true)">
                <v-list-item-title>From Flask url_for to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.application2RCE', true)">
                <v-list-item-title>From Flask application to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.config2RCE', true)">
                <v-list-item-title>From Flask config to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.getFlashedMessages2RCE', true)">
                <v-list-item-title>From Flask get_flashed_messages to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.self2RCE', true)">
                <v-list-item-title>From self to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.lipsum2RCE', true)">
                <v-list-item-title>From lipsum to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.cycler2RCE', true)">
                <v-list-item-title>From cycler to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.joiner2RCE', true)">
                <v-list-item-title>From joiner to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.namespace2RCE', true)">
                <v-list-item-title>From namespace to RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Jinja2.addUrlRule', true)">
                <v-list-item-title>Add a new endpoint for RCE result</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>Java</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.SSTI.Java.commonRCE', true)">
                <v-list-item-title>Common Java Template RCE</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.SSTI.Java.thymeleafRCE', true)">
                <v-list-item-title>Thymeleaf RCE</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            Shell
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>Python Reverse Shell</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.Shell.Python.py3', true)">
                <v-list-item-title>python3</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.Python.py', true)">
                <v-list-item-title>python</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>sh(bash) Reverse Shell</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.Shell.sh.withI', true)">
                <v-list-item-title>sh with -i</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.sh.withoutI', true)">
                <v-list-item-title>sh without -i</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>nc(ncat) Reverse Shell</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.Shell.nc.withE', true)">
                <v-list-item-title>nc with -e</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.nc.withC', true)">
                <v-list-item-title>nc with -c</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-x open-on-hover>
            <template v-slot:activator="{ on }">
              <v-list-item v-on="on" @click.stop>
                <v-list-item-title>PHP Webshell/Reverse Shell</v-list-item-title>
                <v-list-item-action class="justify-end">
                  <v-icon small>mdi-menu-right</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
            <v-list dense>
              <v-list-item @click="applyFunction('Payload.Shell.php.reverseShell', true)">
                <v-list-item-title>Reverse Shell</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.php.webshellEval', true)">
                <v-list-item-title>with eval</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.php.webshellExec', true)">
                <v-list-item-title>with exec</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.php.webshellSystem', true)">
                <v-list-item-title>with system</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.php.webshellBackquote', true)">
                <v-list-item-title>with `</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.php.webshellAllFunction', true)">
                <v-list-item-title>with any function you want (except eval)</v-list-item-title>
              </v-list-item>
              <v-list-item @click="applyFunction('Payload.Shell.php.webshellNoAlphabetsDigits', true)">
                <v-list-item-title>with system && without alphabets and digits (urlencode already)</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            Encoding
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="applyFunction('Encode.URL.encode')">
            <v-list-item-title>URL encode</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.URL.decode')">
            <v-list-item-title>URL decode</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.URL.decodePlus')">
            <v-list-item-title>URL decode (+ => space)</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="applyFunction('Encode.Base64.encode')">
            <v-list-item-title>Base64 encode</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Base64.decode')">
            <v-list-item-title>Base64 decode</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="applyFunction('Encode.Hexadecimal.encode')">
            <v-list-item-title>Hexadecimal encode</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Hexadecimal.decode')">
            <v-list-item-title>Hexadecimal decode</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="applyFunction('Encode.Unicode.encode')">
            <v-list-item-title>Unicode encode</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Unicode.decode')">
            <v-list-item-title>Unicode decode</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="applyFunction('Encode.Escape.hex')">
            <v-list-item-title>Escape ASCII with hex</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Encode.Escape.oct')">
            <v-list-item-title>Escape ASCII with oct</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            Hashing
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="applyFunction('Hash.MD5.digest')">
            <v-list-item-title>MD5</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Hash.SHA1.digest')">
            <v-list-item-title>SHA1</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Hash.SHA256.digest')">
            <v-list-item-title>SHA256</v-list-item-title>
          </v-list-item>
          <v-list-item @click="applyFunction('Hash.SHA512.digest')">
            <v-list-item-title>SHA512</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar-items>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            Theme
            <v-icon small right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="enableDarkTheme(false)">
            <v-list-item-title>Light</v-list-item-title>
          </v-list-item>
          <v-list-item @click="enableDarkTheme(true)">
            <v-list-item-title>Dark</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar-items>
  </v-app-bar>
  <v-main>
    <v-container fluid px-4>
      <v-textarea label="URL" rows="1" ref="url" auto-grow v-model="request.url" @focus="onFocus($event)" @keydown.stop></v-textarea>
      <v-row>
        <v-col cols="12" md="6">
          <v-layout align-center>
            <v-switch label="Enable POST" v-model="request.body.enabled"></v-switch>
            <v-spacer></v-spacer>
            <v-select class="pt-2" v-model="request.body.enctype" :items="supportedEnctype()" label="enctype" v-show="request.body.enabled" dense offset-y></v-select>
          </v-layout>
          <v-textarea label="Body" rows="1" auto-grow v-show="request.body.enabled" v-model="request.body.content" @focus="onFocus($event)" @keydown.stop></v-textarea>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn id="add-header-button" @click="addHeader()">Add Header</v-btn>
          <v-layout class="header-settings" align-center v-for="(header, index) in request.headers" :key="index">
            <v-checkbox v-model="header.enabled"></v-checkbox>
            <v-combobox dense class="px-1 pt-2" label="Name" v-model="header.name" :items="commonRequestHeaders()" @focus="onFocus($event)" :menu-props='{ "maxHeight": 200 }'></v-combobox>
            <v-text-field class="px-1" label="Value" v-model="header.value" @focus="onFocus($event)" @keydown.stop></v-text-field>
            <v-btn icon text @click="deleteHeader(index)">
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </v-layout>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
  <v-dialog max-width="580" v-model="reloadDialog">
    <v-card>
      <v-card-title class="headline">
        Unable to fetch request information
      </v-card-title>
      <v-card-text class="body-1">
        After installing extension, it is required to reload the tab for recording the request.<br><br>

        Note that the extension cannot record sensitive requests. Please visit <a href="https://developer.chrome.com/extensions/webRequest" target="blank">here</a> for more information.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="reloadDialog = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog max-width="580" persistent eager v-model="sqlInjectionDialog.show">
    <v-form @submit.prevent="sqlInjectionDialog.show = false; applyFunction(sqlInjectionDialog.func, true, sqlInjectionDialog)" v-model="sqlInjectionDialog.valid">
      <v-card>
        <v-card-title class="headline">
          SQL Injection
        </v-card-title>
        <v-card-text class="body-1">
          <p v-if="sqlInjectionDialog.positionRequired">The number of columns must be <strong>larger than</strong> or <strong>equal to</strong> output position.</p>
          <p v-else>The number of columns to use in UNION SELECT statement.</p>
          <v-row>
            <v-col>
              <v-text-field type="number" min="1" label="The number of columns" ref="sqlInjectionInput" :rules="[v => /^[1-9][0-9]{0,}$/.test(v) || 'Invalid value']" v-model="sqlInjectionDialog.columns" @keydown.stop required></v-text-field>
            </v-col>
            <v-col v-show="sqlInjectionDialog.positionRequired">
              <v-text-field type="number" min="1" :max="sqlInjectionDialog.columns" label="Output position" :rules="[v => /^[1-9][0-9]{0,}$/.test(v) || 'Invalid value']" v-model="sqlInjectionDialog.position" @keydown.stop required></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="sqlInjectionDialog.show = false">Cancel</v-btn>
          <v-btn text type="submit" :disabled="!sqlInjectionDialog.valid">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
  <v-dialog max-width="580" persistent v-model="testProgressDialog.show">
    <v-card>
      <v-card-title class="headline">
        Test Progress
      </v-card-title>
      <v-card-text class="body-1">
        <p v-if="!testProgressDialog.status">Waiting response from test script...</p>
        <p v-else>Status: {{testProgressDialog.status}}</p>
        <v-progress-linear v-if="!testProgressDialog.result" :indeterminate="!testProgressDialog.percentage" :value="testProgressDialog.percentage"></v-progress-linear>
        <v-data-table v-if="testProgressDialog.result" :headers="testProgressDialog.result.header" :items="testProgressDialog.result.data"></v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text v-if="!testProgressDialog.result" @click="controlTest('toggle')">Pause/Resume</v-btn>
        <v-btn text v-if="!testProgressDialog.result" @click="controlTest('stop')">Stop</v-btn>
        <v-btn text v-if="testProgressDialog.result" @click="testProgressDialog.show = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-model="snackbar.show" color="error" timeout="3000" bottom>
    {{ snackbar.text }}
    <v-btn @click="snackbar.show = false" dark text>Close</v-btn>
  </v-snackbar>
</v-app>
</template>

<script>
import {
  VApp,
  VAppBar,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VCol,
  VCombobox,
  VContainer,
  VDataTable,
  VDialog,
  VDivider,
  VForm,
  VIcon,
  VLayout,
  VList,
  VListItem,
  VListItemAction,
  VListItemTitle,
  VMain,
  VMenu,
  VProgressLinear,
  VRow,
  VSelect,
  VSnackbar,
  VSpacer,
  VSwitch,
  VTextarea,
  VTextField,
  VToolbarItems,
} from 'vuetify/lib'

export default {
  name: 'App',
  components: {
    VApp,
    VAppBar,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCardTitle,
    VCheckbox,
    VCol,
    VCombobox,
    VContainer,
    VDataTable,
    VDialog,
    VDivider,
    VForm,
    VIcon,
    VLayout,
    VList,
    VListItem,
    VListItemAction,
    VListItemTitle,
    VMain,
    VMenu,
    VProgressLinear,
    VRow,
    VSelect,
    VSnackbar,
    VSpacer,
    VSwitch,
    VTextarea,
    VTextField,
    VToolbarItems,
  },
  data: function () {
    return {
      /* DOM element */
      domFocusedInput: null,
      /* Chrome */
      backgroundPageConnection: null,
      /* Dialog */
      reloadDialog: false,
      sqlInjectionDialog: {
        show: false,
        valid: true,
        positionRequired: true,
        func: '',
        columns: '1',
        position: '1'
      },
      testProgressDialog: {
        show: false,
        percentage: null,
        status: null,
        error: null,
        result: null
      },
      /* Error handling */
      snackbar: {
        show: false,
        text: ''
      },
      /* HTTP Request */
      request: {
        url: '',
        body: {
          content: '',
          enctype: 'application/x-www-form-urlencoded',
          enabled: false
        },
        headers: []
      }
    }
  },
  created: function () {
    this.redrawScrollbar()

    this.backgroundPageConnection = chrome.runtime.connect()
    this.backgroundPageConnection.onMessage.addListener(this.handleMessage)
    this.backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: 'init'
    })

    chrome.storage.onChanged.addListener(changes => {
      this.$vuetify.theme.dark = changes.darkThemeEnabled.newValue
      this.redrawScrollbar()
    })
  },
  mounted: async function () {
    this.$vuetify.theme.dark = await this.isDarkThemEnabled()
  },
  methods: {
    load: function () {
      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'load'
      })
    },

    split: function () {
      this.request.url = this.request.url.replace(/[^\n][?&#]/g, str => {
        return str[0] + '\n' + str[1]
      })

      if (typeof this.request.body.content !== 'undefined' &&
        this.request.body.enctype !== 'multipart/form-data') {
        this.request.body.content = this.request.body.content.replace(
          /[^\n][?&#]/g, str => {
            return str[0] + '\n' + str[1]
          })
      }
    },

    execute: function () {
      if (this.request.url.length === 0) {
        return
      }

      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'execute',
        data: this.request
      })
    },

    controlTest: function (action, script = undefined, argument = undefined) {
      if (action === 'start') {
        this.testProgressDialog.percentage = null
        this.testProgressDialog.status = null
        this.testProgressDialog.result = null
        this.testProgressDialog.error = null
        this.testProgressDialog.show = true
      }

      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'test',
        data: { action, script, argument }
      })
    },

    addHeader: function () {
      this.request.headers.unshift({
        enabled: true,
        name: '',
        value: ''
      })
    },

    deleteHeader: function (index) {
      this.request.headers.splice(index, 1)
    },

    enableDarkTheme: function (enabled) {
      chrome.storage.local.set({
        darkThemeEnabled: enabled
      })
    },

    redrawScrollbar: function () {
      document.documentElement.className = this.$vuetify.theme.dark
        ? 'theme--dark'
        : 'theme--light'
      /* force to redraw scrollbar */
      document.documentElement.style.overflowY = 'hidden'
      document.documentElement.clientHeight.toString()
      document.documentElement.style.overflowY = 'scroll'
    },

    getNamespaceByPath: function (path, root, returnName) {
      let namespace = (typeof root === 'undefined') ? window : root

      path = path.split('.')
      for (let idx = 0; idx < path.length - 1; idx++) {
        if (typeof namespace[path[idx]] !== 'undefined') {
          namespace = namespace[path[idx]]
        } else {
          return undefined
        }
      }

      if (returnName === true) {
        return {
          namespace: namespace,
          name: path.pop()
        }
      } else {
        return namespace
      }
    },

    applyFunction: function (func, insertWhenNoSelection = false, argument = undefined) {
      func = this.getNamespaceByPath(func, window, true)

      if (this.domFocusedInput === null) {
        return
      }

      let startIndex = this.domFocusedInput.selectionStart
      let endIndex = this.domFocusedInput.selectionEnd
      const textSelected = (endIndex - startIndex !== 0)
      const inputText = this.domFocusedInput.value

      if (typeof argument === 'undefined') {
        if (textSelected === true) {
          argument = inputText.substring(startIndex, endIndex)
        } else if (insertWhenNoSelection === true) {
          argument = ''
        } else {
          argument = inputText
        }
      }

      let processed = argument
      try {
        processed = func.namespace[func.name](argument)
      } catch (error) {
        this.snackbar.text = error.message
        this.snackbar.show = true
      }

      this.$nextTick(() => {
        this.domFocusedInput.focus()
        if (textSelected !== true && insertWhenNoSelection !== true) {
          startIndex = 0
          endIndex = inputText.length

          document.execCommand('selectAll')
        }

        document.execCommand('insertText', false, processed)

        this.domFocusedInput.setSelectionRange(
          startIndex + ((textSelected === true) ? 0 : processed.length),
          startIndex + processed.length)
      })
    },

    sqlInjectionPrompt: function (func, positionRequired = true) {
      this.sqlInjectionDialog.func = func
      this.sqlInjectionDialog.show = true
      this.sqlInjectionDialog.positionRequired = positionRequired !== false
      this.$nextTick(this.$refs.sqlInjectionInput.focus)
    },

    testCommonPathsAgainstRoot: function() {
      this.controlTest('start', 'scripts/test/paths.js', {
        payloadsPath: chrome.runtime.getURL('payloads/paths.txt'),
        againstWebRoot: true,
      })
    },

    testCommonPathsAgainstCurrent: function() {
      this.controlTest('start', 'scripts/test/paths.js', {
        payloadsPath: chrome.runtime.getURL('payloads/paths.txt'),
        againstWebRoot: false,
      })
    },

    onFocus: function (event) {
      this.domFocusedInput = event.target
    },

    handleMessage: function (message, sender, sendResponse) {
      if (message.type === 'load') {
        if (typeof message.data === 'undefined') {
          this.reloadDialog = true
          return
        }

        const request = message.data

        this.request.url = request.url
        this.request.body.enabled = (typeof request.body !== 'undefined')
        if (typeof request.contentType !== 'undefined') {
          this.request.body.enctype = request.contentType.split(';', 1)[0].trim()
        }

        if (this.request.body.enabled) {
          if (typeof request.body.formData !== 'undefined') {
            const params = new URLSearchParams()

            for (const name in request.body.formData) {
              request.body.formData[name].forEach(value => {
                params.append(name, value)
              })
            }

            this.request.body.content = params.toString()
          } else {
            this.request.body.content = ''

            request.body.raw.forEach(data => {
              if (typeof data.file !== 'undefined') {
                this.request.body.content += `[Content of '${data.file}']`
              } else {
                this.request.body.content += data.bytes
              }
            })
          }
        }

        this.$refs.url.focus()
      } else if (message.type === 'command') {
        switch (message.data) {
          case 'load_url':
            this.load()
            break
          case 'split_url':
            this.split()
            break
          case 'execute_url':
            this.execute()
            break
        }
      } else if (message.type === 'error') {
        this.snackbar.text = message.data
        this.snackbar.show = true
      } else if (message.type === 'test') {
        const report = message.data

        switch (report.type) {
          case 'progress':
            this.testProgressDialog.status = report.data.status ||
                                              this.testProgressDialog.status
            this.testProgressDialog.percentage = report.data.percentage ||
                                                  this.testProgressDialog.percentage
            break
          case 'finished':
            if (this.testProgressDialog.error === null) {
              this.testProgressDialog.status = 'Finished'
            } else if (this.testProgressDialog.status !== null) {
              this.testProgressDialog.status += ` (${this.testProgressDialog.error})`
            } else {
              this.testProgressDialog.status = this.testProgressDialog.error
            }
            this.testProgressDialog.result = report.data
            break
          case 'error':
            this.testProgressDialog.error = report.data
            this.snackbar.text = report.data
            this.snackbar.show = true
            break
        }
      }
    },

    isDarkThemEnabled: function () {
      const isSystemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

      return new Promise(resolve => {
        chrome.storage.local.get(
          { darkThemeEnabled: isSystemDarkMode },
          ({ darkThemeEnabled }) => resolve(darkThemeEnabled))
      })
    },

    supportedEnctype: function () {
      return [
        'application/x-www-form-urlencoded',
        'application/x-www-form-urlencoded (raw)',
        'multipart/form-data',
        'application/json'
      ]
    },

    commonRequestHeaders: function () {
      return [
        'Accept',
        'Accept-Charset',
        'Accept-Datetime',
        'Accept-Encoding',
        'Accept-Language',
        'Access-Control-Request-Headers',
        'Access-Control-Request-Method',
        'A-IM',
        'Authorization',
        'Cache-Control',
        'Connection',
        'Content-Length',
        'Content-MD5',
        'Content-Type',
        'Cookie',
        'Date',
        'DNT',
        'Expect',
        'Forwarded',
        'From',
        'Front-End-Https',
        'Host',
        'HTTP2-Settings',
        'If-Match',
        'If-Modified-Since',
        'If-None-Match',
        'If-Range',
        'If-Unmodified-Since',
        'Max-Forwards',
        'Origin',
        'Pragma',
        'Proxy-Authorization',
        'Proxy-Connection',
        'Range',
        'Referer',
        'Save-Data',
        'TE',
        'Upgrade',
        'Upgrade-Insecure-Requests',
        'User-Agent',
        'Via',
        'Warning',
        'X-ATT-DeviceId',
        'X-Correlation-ID',
        'X-Csrf-Token',
        'X-Forwarded-For',
        'X-Forwarded-Host',
        'X-Forwarded-Proto',
        'X-Http-Method-Override',
        'X-Requested-With',
        'X-Request-ID',
        'X-UIDH',
        'X-Wap-Profile'
      ]
    }
  }
}
</script>