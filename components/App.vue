<template>
  <VApp>
    <VAppBar app dense flat>
      <VToolbarItems>
        <VBtn text @click="load()">Load</VBtn>
        <VBtn text @click="split()">Split</VBtn>
        <VBtn text @click="execute()">Execute</VBtn>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              Test
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>Common paths</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem @click="testCommonPathsAgainstRoot()">
                  <VListItemTitle>Against web root directory</VListItemTitle>
                </VListItem>
                <VListItem @click="testCommonPathsAgainstCurrent()">
                  <VListItemTitle>Against current directory</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VList>
        </VMenu>
        <VDivider inset vertical></VDivider>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              SQLi
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>MySQL</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="
                    sqlInjectionPrompt('Payload.SQLi.MySQL.dumpDatabases')
                  "
                >
                  <VListItemTitle>Dump all database names</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpTables')"
                >
                  <VListItemTitle>Dump tables from database</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpColumns')"
                >
                  <VListItemTitle>Dump columns from database</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.SQLi.MySQL.dumpCurrentQueries', true)
                  "
                >
                  <VListItemTitle>Dump current queries payload</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.SQLi.MySQL.dumpInOneShot', true)
                  "
                >
                  <VListItemTitle>Dump in one shot payload</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    sqlInjectionPrompt('Payload.SQLi.MySQL.unionSelect', false)
                  "
                >
                  <VListItemTitle>Union select statement</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SQLi.MySQL.errorBased', true)"
                >
                  <VListItemTitle>
                    Error-based injection statement
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>PostgreSQL</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="
                    sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpDatabases')
                  "
                >
                  <VListItemTitle>Dump all database names</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpTables')
                  "
                >
                  <VListItemTitle>Dump tables from database</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpColumns')
                  "
                >
                  <VListItemTitle>Dump columns from database</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    sqlInjectionPrompt(
                      'Payload.SQLi.PostgreSQL.unionSelect',
                      false,
                    )
                  "
                >
                  <VListItemTitle>Union select statement</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.SQLi.PostgreSQL.errorBased', true)
                  "
                >
                  <VListItemTitle>
                    Error-based injection statement
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>SQLite</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="sqlInjectionPrompt('Payload.SQLi.SQLite.dumpTables')"
                >
                  <VListItemTitle>Dump tables from database</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="sqlInjectionPrompt('Payload.SQLi.SQLite.dumpColumns')"
                >
                  <VListItemTitle>
                    Dump columns from database (also wit h table name)
                  </VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    sqlInjectionPrompt('Payload.SQLi.SQLite.unionSelect', false)
                  "
                >
                  <VListItemTitle>Union select statement</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VListItem @click="applyFunction('Payload.SQLi.polyglot', true)">
              <VListItemTitle>Polyglot</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Payload.SQLi.spaceToComment')">
              <VListItemTitle>Space to Inline comment</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              XSS
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>Vue.js</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="
                    applyFunction('Payload.XSS.Vue.vue2Interpolation', true)
                  "
                >
                  <VListItemTitle>Vue 2 - Interpolation</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.XSS.Vue.vue2Directive', true)"
                >
                  <VListItemTitle>Vue 2 - Directive</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.XSS.Vue.vue3Interpolation', true)
                  "
                >
                  <VListItemTitle>Vue 3 - Interpolation</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.XSS.Vue.vue3DynamicComponent', true)
                  "
                >
                  <VListItemTitle>Vue 3 - Dynamic Component</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle> Angular.js for strict CSP </VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="
                    applyFunction(
                      'Payload.XSS.AngularJS.angularJS1_6WithPrototype$on',
                      true,
                    )
                  "
                >
                  <VListItemTitle>
                    AngularJS >= 1.6 with Prototype Library
                  </VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction(
                      'Payload.XSS.AngularJS.angularJSWith$event',
                      true,
                    )
                  "
                >
                  <VListItemTitle>
                    AngularJS All Version (Chrome Only)
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>CTF Snippets</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="
                    applyFunction('Payload.XSS.snippets.getSamesiteFlag', true)
                  "
                >
                  <VListItemTitle>Get flag from '/flag'</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.XSS.snippets.getCookieFlag', true)
                  "
                >
                  <VListItemTitle>Get flag from document.cookie</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.XSS.snippets.getStorageFlag', true)
                  "
                >
                  <VListItemTitle>
                    Get flag from localStorage.flag
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>HTML</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem @click="applyFunction('Encode.Html.encode2Hex')">
                  <VListItemTitle>Encode using hex</VListItemTitle>
                </VListItem>
                <VListItem @click="applyFunction('Encode.Html.encode2Dec')">
                  <VListItemTitle>Encode using dec</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Encode.Html.encode2EntityName')"
                >
                  <VListItemTitle>Encode using entity name</VListItemTitle>
                </VListItem>
                <VListItem @click="applyFunction('Encode.Html.decodeFromHex')">
                  <VListItemTitle>Decode using hex</VListItemTitle>
                </VListItem>
                <VListItem @click="applyFunction('Encode.Html.decodeFromDec')">
                  <VListItemTitle>Decode using dec</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Encode.Html.decodeFromEntityName')"
                >
                  <VListItemTitle>Decode using entity name</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>String.fromCharCode</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem @click="applyFunction('Encode.CharCode.encode')">
                  <VListItemTitle>Encode</VListItemTitle>
                </VListItem>
                <VListItem @click="applyFunction('Encode.CharCode.decode')">
                  <VListItemTitle>Decode</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VListItem @click="applyFunction('Payload.XSS.polyglot', true)">
              <VListItemTitle>Polyglot</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              LFI
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VListItem
              @click="applyFunction('Payload.LFI.phpWrapperBas64', true)"
            >
              <VListItemTitle>PHP wrapper - Base64</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              SSTI
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>Jinja2 (Python)</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="
                    applyFunction(
                      'Payload.SSTI.Jinja2.tuple2AllSubclasses',
                      true,
                    )
                  "
                >
                  <VListItemTitle>Show subclasses with tuple</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.tuple2RCE', true)"
                >
                  <VListItemTitle>From Tuple to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.g2RCE', true)"
                >
                  <VListItemTitle>From Flask g to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.urlFor2RCE', true)"
                >
                  <VListItemTitle>From Flask url_for to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.SSTI.Jinja2.application2RCE', true)
                  "
                >
                  <VListItemTitle>From Flask application to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.config2RCE', true)"
                >
                  <VListItemTitle>From Flask config to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction(
                      'Payload.SSTI.Jinja2.getFlashedMessages2RCE',
                      true,
                    )
                  "
                >
                  <VListItemTitle>
                    From Flask get_flashed_messages to RCE
                  </VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.self2RCE', true)"
                >
                  <VListItemTitle>From self to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.lipsum2RCE', true)"
                >
                  <VListItemTitle>From lipsum to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.cycler2RCE', true)"
                >
                  <VListItemTitle>From cycler to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.joiner2RCE', true)"
                >
                  <VListItemTitle>From joiner to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.SSTI.Jinja2.namespace2RCE', true)
                  "
                >
                  <VListItemTitle>From namespace to RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Jinja2.addUrlRule', true)"
                >
                  <VListItemTitle>
                    Add a new endpoint for RCE result
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>Java</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Java.commonRCE', true)"
                >
                  <VListItemTitle>Common Java Template RCE</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.SSTI.Java.thymeleafRCE', true)"
                >
                  <VListItemTitle>Thymeleaf RCE</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VList>
        </VMenu>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              Shell
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>Python Reverse Shell</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="applyFunction('Payload.Shell.Python.py3', true)"
                >
                  <VListItemTitle>python3</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.Shell.Python.py', true)"
                >
                  <VListItemTitle>python</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>sh(bash) Reverse Shell</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="applyFunction('Payload.Shell.sh.withI', true)"
                >
                  <VListItemTitle>sh with -i</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.Shell.sh.withoutI', true)"
                >
                  <VListItemTitle>sh without -i</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>nc(ncat) Reverse Shell</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="applyFunction('Payload.Shell.nc.withE', true)"
                >
                  <VListItemTitle>nc with -e</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.Shell.nc.withC', true)"
                >
                  <VListItemTitle>nc with -c</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
            <VMenu offset-x open-on-hover>
              <template #activator="{ on }">
                <VListItem v-on="on" @click.stop>
                  <VListItemTitle>PHP Webshell/Reverse Shell</VListItemTitle>
                  <VListItemAction class="justify-end">
                    <VIcon small>mdi-menu-right</VIcon>
                  </VListItemAction>
                </VListItem>
              </template>
              <VList dense>
                <VListItem
                  @click="applyFunction('Payload.Shell.php.reverseShell', true)"
                >
                  <VListItemTitle>Reverse Shell</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.Shell.php.webshellEval', true)"
                >
                  <VListItemTitle>with eval</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="applyFunction('Payload.Shell.php.webshellExec', true)"
                >
                  <VListItemTitle>with exec</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.Shell.php.webshellSystem', true)
                  "
                >
                  <VListItemTitle>with system</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.Shell.php.webshellBackquote', true)
                  "
                >
                  <VListItemTitle>with `</VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction('Payload.Shell.php.webshellAllFunction', true)
                  "
                >
                  <VListItemTitle>
                    with any function you want (except eval)
                  </VListItemTitle>
                </VListItem>
                <VListItem
                  @click="
                    applyFunction(
                      'Payload.Shell.php.webshellNoAlphabetsDigits',
                      true,
                    )
                  "
                >
                  <VListItemTitle>
                    with system && without alphabets and digits (urlencode
                    already)
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VList>
        </VMenu>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              Encoding
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VListItem @click="applyFunction('Encode.URL.encode')">
              <VListItemTitle>URL encode</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Encode.URL.decode')">
              <VListItemTitle>URL decode</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Encode.URL.decodePlus')">
              <VListItemTitle>URL decode (+ => space)</VListItemTitle>
            </VListItem>
            <VDivider></VDivider>
            <VListItem @click="applyFunction('Encode.Base64.encode')">
              <VListItemTitle>Base64 encode</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Encode.Base64.decode')">
              <VListItemTitle>Base64 decode</VListItemTitle>
            </VListItem>
            <VDivider></VDivider>
            <VListItem @click="applyFunction('Encode.Hexadecimal.encode')">
              <VListItemTitle>Hexadecimal encode</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Encode.Hexadecimal.decode')">
              <VListItemTitle>Hexadecimal decode</VListItemTitle>
            </VListItem>
            <VDivider></VDivider>
            <VListItem @click="applyFunction('Encode.Unicode.encode')">
              <VListItemTitle>Unicode encode</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Encode.Unicode.decode')">
              <VListItemTitle>Unicode decode</VListItemTitle>
            </VListItem>
            <VDivider></VDivider>
            <VListItem @click="applyFunction('Encode.Escape.hex')">
              <VListItemTitle>Escape ASCII with hex</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Encode.Escape.oct')">
              <VListItemTitle>Escape ASCII with oct</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              Hashing
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VListItem @click="applyFunction('Hash.MD5.digest')">
              <VListItemTitle>MD5</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Hash.SHA1.digest')">
              <VListItemTitle>SHA1</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Hash.SHA256.digest')">
              <VListItemTitle>SHA256</VListItemTitle>
            </VListItem>
            <VListItem @click="applyFunction('Hash.SHA512.digest')">
              <VListItemTitle>SHA512</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </VToolbarItems>
      <VSpacer></VSpacer>
      <VToolbarItems>
        <VMenu offset-y>
          <template #activator="{ on }">
            <VBtn text v-on="on">
              Theme
              <VIcon small right>mdi-menu-down</VIcon>
            </VBtn>
          </template>
          <VList dense>
            <VListItem @click="enableDarkTheme(false)">
              <VListItemTitle>Light</VListItemTitle>
            </VListItem>
            <VListItem @click="enableDarkTheme(true)">
              <VListItemTitle>Dark</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </VToolbarItems>
    </VAppBar>
    <VMain>
      <VContainer fluid px-4>
        <VTextarea
          ref="url"
          v-model="request.url"
          label="URL"
          rows="1"
          auto-grow
          @focus="onFocus($event)"
          @keydown.stop
        ></VTextarea>
        <VRow>
          <VCol cols="12" md="6">
            <VLayout align-center>
              <VSwitch
                v-model="request.body.enabled"
                label="Enable POST"
              ></VSwitch>
              <VSpacer></VSpacer>
              <VSelect
                v-show="request.body.enabled"
                v-model="request.body.enctype"
                class="pt-2"
                :items="supportedEnctype()"
                label="enctype"
                dense
                offset-y
              ></VSelect>
            </VLayout>
            <VTextarea
              v-show="request.body.enabled"
              v-model="request.body.content"
              label="Body"
              rows="1"
              auto-grow
              @focus="onFocus($event)"
              @keydown.stop
            ></VTextarea>
          </VCol>
          <VCol cols="12" md="6">
            <VBtn id="add-header-button" @click="addHeader()">Add Header</VBtn>
            <VLayout
              v-for="(header, index) in request.headers"
              :key="index"
              class="header-settings"
              align-center
            >
              <VCheckbox v-model="header.enabled"></VCheckbox>
              <VCombobox
                v-model="header.name"
                dense
                class="px-1 pt-2"
                label="Name"
                :items="commonRequestHeaders()"
                :menu-props="{ maxHeight: 200 }"
                @focus="onFocus($event)"
              ></VCombobox>
              <VTextField
                v-model="header.value"
                class="px-1"
                label="Value"
                @focus="onFocus($event)"
                @keydown.stop
              ></VTextField>
              <VBtn icon text @click="deleteHeader(index)">
                <VIcon small>mdi-close</VIcon>
              </VBtn>
            </VLayout>
          </VCol>
        </VRow>
      </VContainer>
    </VMain>
    <VDialog v-model="reloadDialog" max-width="580">
      <VCard>
        <VCardTitle class="headline">
          Unable to fetch request information
        </VCardTitle>
        <VCardText class="body-1">
          After installing extension, it is required to reload the tab for
          recording the request.<br /><br />

          Note that the extension cannot record sensitive requests. Please visit
          <a
            href="https://developer.chrome.com/extensions/webRequest"
            target="blank"
            >here</a
          >
          for more information.
        </VCardText>
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn text @click="reloadDialog = false">OK</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
    <VDialog v-model="sqlInjectionDialog.show" max-width="580" persistent eager>
      <VForm
        v-model="sqlInjectionDialog.valid"
        @submit.prevent="
          sqlInjectionDialog.show = false
          applyFunction(sqlInjectionDialog.func, true, sqlInjectionDialog)
        "
      >
        <VCard>
          <VCardTitle class="headline"> SQL Injection </VCardTitle>
          <VCardText class="body-1">
            <p v-if="sqlInjectionDialog.positionRequired">
              The number of columns must be <strong>larger than</strong> or
              <strong>equal to</strong> output position.
            </p>
            <p v-else>
              The number of columns to use in UNION SELECT statement.
            </p>
            <VRow>
              <VCol>
                <VTextField
                  ref="sqlInjectionInput"
                  v-model="sqlInjectionDialog.columns"
                  type="number"
                  min="1"
                  label="The number of columns"
                  :rules="[v => /^[1-9][0-9]{0,}$/.test(v) || 'Invalid value']"
                  required
                  @keydown.stop
                ></VTextField>
              </VCol>
              <VCol v-show="sqlInjectionDialog.positionRequired">
                <VTextField
                  v-model="sqlInjectionDialog.position"
                  type="number"
                  min="1"
                  :max="sqlInjectionDialog.columns"
                  label="Output position"
                  :rules="[v => /^[1-9][0-9]{0,}$/.test(v) || 'Invalid value']"
                  required
                  @keydown.stop
                ></VTextField>
              </VCol>
            </VRow>
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn text @click="sqlInjectionDialog.show = false">Cancel</VBtn>
            <VBtn text type="submit" :disabled="!sqlInjectionDialog.valid"
              >OK</VBtn
            >
          </VCardActions>
        </VCard>
      </VForm>
    </VDialog>
    <VDialog v-model="testProgressDialog.show" max-width="580" persistent>
      <VCard>
        <VCardTitle class="headline"> Test Progress </VCardTitle>
        <VCardText class="body-1">
          <p v-if="!testProgressDialog.status">
            Waiting response from test script...
          </p>
          <p v-else>Status: {{ testProgressDialog.status }}</p>
          <VProgressLinear
            v-if="!testProgressDialog.result"
            :indeterminate="!testProgressDialog.percentage"
            :value="testProgressDialog.percentage"
          ></VProgressLinear>
          <VDataTable
            v-if="testProgressDialog.result"
            :headers="testProgressDialog.result.header"
            :items="testProgressDialog.result.data"
          ></VDataTable>
        </VCardText>
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn
            v-if="!testProgressDialog.result"
            text
            @click="controlTest('toggle')"
            >Pause/Resume</VBtn
          >
          <VBtn
            v-if="!testProgressDialog.result"
            text
            @click="controlTest('stop')"
            >Stop</VBtn
          >
          <VBtn
            v-if="testProgressDialog.result"
            text
            @click="testProgressDialog.show = false"
            >Close</VBtn
          >
        </VCardActions>
      </VCard>
    </VDialog>
    <VSnackbar v-model="snackbar.show" color="error" timeout="3000" bottom>
      {{ snackbar.text }}
      <VBtn dark text @click="snackbar.show = false">Close</VBtn>
    </VSnackbar>
  </VApp>
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
  VTextField,
  VTextarea,
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
        position: '1',
      },
      testProgressDialog: {
        show: false,
        percentage: null,
        status: null,
        error: null,
        result: null,
      },
      /* Error handling */
      snackbar: {
        show: false,
        text: '',
      },
      /* HTTP Request */
      request: {
        url: '',
        body: {
          content: '',
          enctype: 'application/x-www-form-urlencoded',
          enabled: false,
        },
        headers: [],
      },
    }
  },
  created: function () {
    this.redrawScrollbar()

    this.backgroundPageConnection = chrome.runtime.connect()
    this.backgroundPageConnection.onMessage.addListener(this.handleMessage)
    this.backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: 'init',
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
        type: 'load',
      })
    },

    split: function () {
      this.request.url = this.request.url.replace(/[^\n][?&#]/g, str => {
        return str[0] + '\n' + str[1]
      })

      if (
        typeof this.request.body.content !== 'undefined' &&
        this.request.body.enctype !== 'multipart/form-data'
      ) {
        this.request.body.content = this.request.body.content.replace(
          /[^\n][?&#]/g,
          str => {
            return str[0] + '\n' + str[1]
          },
        )
      }
    },

    execute: function () {
      if (this.request.url.length === 0) {
        return
      }

      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'execute',
        data: this.request,
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
        data: { action, script, argument },
      })
    },

    addHeader: function () {
      this.request.headers.unshift({
        enabled: true,
        name: '',
        value: '',
      })
    },

    deleteHeader: function (index) {
      this.request.headers.splice(index, 1)
    },

    enableDarkTheme: function (enabled) {
      chrome.storage.local.set({
        darkThemeEnabled: enabled,
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
      let namespace = typeof root === 'undefined' ? window : root

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
          name: path.pop(),
        }
      } else {
        return namespace
      }
    },

    applyFunction: function (
      func,
      insertWhenNoSelection = false,
      argument = undefined,
    ) {
      func = this.getNamespaceByPath(func, window, true)

      if (this.domFocusedInput === null) {
        return
      }

      let startIndex = this.domFocusedInput.selectionStart
      let endIndex = this.domFocusedInput.selectionEnd
      const textSelected = endIndex - startIndex !== 0
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
          startIndex + (textSelected === true ? 0 : processed.length),
          startIndex + processed.length,
        )
      })
    },

    sqlInjectionPrompt: function (func, positionRequired = true) {
      this.sqlInjectionDialog.func = func
      this.sqlInjectionDialog.show = true
      this.sqlInjectionDialog.positionRequired = positionRequired !== false
      this.$nextTick(this.$refs.sqlInjectionInput.focus)
    },

    testCommonPathsAgainstRoot: function () {
      this.controlTest('start', 'scripts/test/paths.js', {
        payloadsPath: chrome.runtime.getURL('payloads/paths.txt'),
        againstWebRoot: true,
      })
    },

    testCommonPathsAgainstCurrent: function () {
      this.controlTest('start', 'scripts/test/paths.js', {
        payloadsPath: chrome.runtime.getURL('payloads/paths.txt'),
        againstWebRoot: false,
      })
    },

    onFocus: function (event) {
      this.domFocusedInput = event.target
    },

    handleMessage: function (message) {
      if (message.type === 'load') {
        if (typeof message.data === 'undefined') {
          this.reloadDialog = true
          return
        }

        const request = message.data

        this.request.url = request.url
        this.request.body.enabled = typeof request.body !== 'undefined'
        if (typeof request.contentType !== 'undefined') {
          this.request.body.enctype = request.contentType
            .split(';', 1)[0]
            .trim()
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
            this.testProgressDialog.status =
              report.data.status || this.testProgressDialog.status
            this.testProgressDialog.percentage =
              report.data.percentage || this.testProgressDialog.percentage
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
      const isSystemDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches

      return new Promise(resolve => {
        chrome.storage.local.get(
          { darkThemeEnabled: isSystemDarkMode },
          ({ darkThemeEnabled }) => resolve(darkThemeEnabled),
        )
      })
    },

    supportedEnctype: function () {
      return [
        'application/x-www-form-urlencoded',
        'application/x-www-form-urlencoded (raw)',
        'multipart/form-data',
        'application/json',
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
        'X-Wap-Profile',
      ]
    },
  },
}
</script>
