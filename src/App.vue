<template>
  <VThemeProvider :theme="theme" with-background>
    <VApp>
      <VAppBar
        ref="appBar"
        density="compact"
        app
        flat
        @wheel.prevent="onScrollAppBar"
      >
        <VBtn variant="text" @click="load">Load</VBtn>
        <VBtn variant="text" @click="split">Split</VBtn>
        <VBtn variant="text" @click="execute">Execute</VBtn>
        <MenuTest />
        <VDivider vertical />
        <MenuSqli />
        <MenuXss />
        <MenuLfi />
        <MenuSsti />
        <MenuShell />
        <MenuEncoding />
        <MenuHashing />
        <VSpacer />
        <VMenu>
          <template #activator="{ props }">
            <VBtn append-icon="mdi-menu-down" variant="text" v-bind="props">
              Theme
            </VBtn>
          </template>
          <VList>
            <VListItem title="Light" @click="enableDarkTheme(false)" />
            <VListItem title="Dark" @click="enableDarkTheme(true)" />
          </VList>
        </VMenu>
      </VAppBar>
      <VMain>
        <VContainer fluid>
          <VTextarea
            ref="urlInput"
            v-model="request.url"
            auto-grow
            class="pb-3"
            hide-details
            label="URL"
            :rows="1"
            variant="underlined"
            @focus="onFocus"
            @keydown.stop
          />
          <VRow>
            <VCol cols="12" md="6">
              <div class="d-flex align-center">
                <VSwitch
                  v-model="request.body.enabled"
                  :color="theme === 'dark' ? 'white' : 'black'"
                  label="Enable POST"
                  hide-details
                />
                <VSelect
                  v-show="request.body.enabled"
                  v-model="request.body.enctype"
                  density="compact"
                  :items="getSupportedEnctype()"
                  label="enctype"
                  variant="underlined"
                  hide-details
                />
              </div>
              <VTextarea
                v-show="request.body.enabled"
                v-model="request.body.content"
                label="Body"
                :rows="1"
                variant="underlined"
                auto-grow
                hide-details
                @focus="onFocus"
                @keydown.stop
              />
            </VCol>
            <VCol cols="12" md="6">
              <div class="pt-2 pb-1">
                <VBtn @click="addHeader"> Add Header </VBtn>
              </div>
              <div
                v-for="(header, index) in request.headers"
                :key="header._createdAt"
                class="d-flex pt-3 align-center"
              >
                <VCheckboxBtn v-model="header.enabled" hide-details />
                <VCombobox
                  v-model="header.name"
                  :items="getCommonRequestHeaders()"
                  label="Name"
                  :menu-props="{ maxHeight: 200 }"
                  style="flex: 1 0"
                  variant="underlined"
                  hide-details
                  @focus="onFocus"
                />
                <VTextField
                  v-model="header.value"
                  class="pl-2"
                  style="flex: 1 0"
                  label="Value"
                  variant="underlined"
                  hide-details
                  @focus="onFocus"
                  @keydown.stop
                />
                <VBtn
                  icon="mdi-close"
                  size="small"
                  variant="text"
                  @click="deleteHeader(index)"
                />
              </div>
            </VCol>
          </VRow>
        </VContainer>
      </VMain>
      <DialogReloadPrompt v-model="reloadDialog" />
      <DialogSqlInjectionSetting v-model="sqlInjectionDialog" />
      <DialogReverseShellSetting v-model="reverseShellDialog" />
      <DialogTestProgress v-model="testProgressDialog" />
      <VSnackbar v-model="snackbar.show" color="error" :timeout="3000" bottom>
        {{ snackbar.text }}
        <template #actions>
          <VBtn variant="text" @click="snackbar.show = false">Close</VBtn>
        </template>
      </VSnackbar>
    </VApp>
  </VThemeProvider>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, provide, ref, watch } from 'vue'
import { VAppBar, VTextarea } from 'vuetify'
import DialogReloadPrompt from './components/DialogReloadPrompt.vue'
import DialogReverseShellSetting from './components/DialogReverseShellSetting.vue'
import DialogSqlInjectionSetting from './components/DialogSqlInjectionSetting.vue'
import DialogTestProgress from './components/DialogTestProgress.vue'
import MenuEncoding from './components/MenuEncoding.vue'
import MenuHashing from './components/MenuHashing.vue'
import MenuLfi from './components/MenuLfi.vue'
import MenuShell from './components/MenuShell.vue'
import MenuSqli from './components/MenuSqli.vue'
import MenuSsti from './components/MenuSsti.vue'
import MenuTest from './components/MenuTest.vue'
import MenuXss from './components/MenuXss.vue'

export default defineComponent({
  name: 'App',
  components: {
    MenuTest,
    MenuSqli,
    MenuXss,
    MenuLfi,
    MenuSsti,
    MenuShell,
    MenuEncoding,
    MenuHashing,
    DialogReloadPrompt,
    DialogSqlInjectionSetting,
    DialogTestProgress,
    DialogReverseShellSetting,
  },
  setup() {
    /* DOM element and refs */
    let domFocusedInput: HTMLInputElement | null = null
    const appBar = ref<InstanceType<typeof VAppBar>>()
    const urlInput = ref<InstanceType<typeof VTextarea>>()

    /* Dialog */
    const reloadDialog = ref({
      show: false,
    })
    const sqlInjectionDialog = ref({
      show: false,
      positionRequired: true,
      func: '',
    })
    const reverseShellDialog = ref({
      show: false,
      positionRequired: true,
      func: '',
    })
    const testProgressDialog = ref({
      show: false,
      percentage: 0,
      status: '',
      error: '',
      result: null as TestResult | null,
    })
    /* Snackbar */
    const snackbar = ref({
      show: false,
      text: '',
    })
    /* HTTP Request */
    const request = ref<BrowseRequest>({
      url: '',
      body: {
        content: '',
        enctype: 'application/x-www-form-urlencoded',
        enabled: false,
      },
      headers: [],
    })

    /* Communication */
    if (process.env.NODE_ENV === 'development') {
      const noopProxy = new Proxy(
        {},
        {
          get(target, property, receiver) {
            const fn = () => receiver
            Object.setPrototypeOf(fn, receiver)
            return fn
          },
        },
      )
      // @ts-ignore
      // eslint-disable-next-line no-global-assign
      chrome = noopProxy
    }

    const backgroundPageConnection = chrome.runtime.connect()

    const load = () => {
      backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'load',
      })
    }

    const split = () => {
      request.value.url = request.value.url.replace(/[^\n][?&#]/g, str => {
        return str[0] + '\n' + str[1]
      })

      if (
        request.value.body.content &&
        request.value.body.enctype !== 'multipart/form-data'
      ) {
        request.value.body.content = request.value.body.content.replace(
          /[^\n][?&#]/g,
          str => {
            return str[0] + '\n' + str[1]
          },
        )
      }
    }

    const execute = () => {
      if (request.value.url.length === 0) {
        return
      }

      backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'execute',
        data: request.value,
      })
    }

    function isLoadMessage(
      m: DevtoolsFunctionMessage,
    ): m is DevtoolsLoadMessage {
      return m.type === 'load'
    }

    function isCommandMessage(
      m: DevtoolsFunctionMessage,
    ): m is DevtoolsCommandMessage {
      return m.type === 'command'
    }

    function isErrorMessage(
      m: DevtoolsFunctionMessage,
    ): m is DevtoolsErrorMessage {
      return m.type === 'error'
    }

    function isTestMessage(
      m: DevtoolsFunctionMessage,
    ): m is DevtoolsTestMessage {
      return m.type === 'test'
    }

    const handleMessage = (message: DevtoolsFunctionMessage) => {
      if (isLoadMessage(message)) {
        if (!message.data) {
          reloadDialog.value.show = true
          return
        }

        if (!getSupportedEnctype().includes(message.data.body.enctype)) {
          // Limit enctype
          message.data.body.enctype = request.value.body.enctype
        }

        request.value.url = message.data.url
        request.value.body = message.data.body
        urlInput.value?.focus()
      } else if (isCommandMessage(message)) {
        switch (message.data) {
          case 'load_url':
            load()
            break
          case 'split_url':
            split()
            break
          case 'execute_url':
            execute()
            break
        }
      } else if (isErrorMessage(message)) {
        snackbar.value.text = message.data
        snackbar.value.show = true
      } else if (isTestMessage(message)) {
        const report = message.data

        switch (report.type) {
          case 'progress':
            testProgressDialog.value.status =
              report.data.status || testProgressDialog.value.status
            testProgressDialog.value.percentage =
              report.data.percentage || testProgressDialog.value.percentage
            break
          case 'finished':
            if (!testProgressDialog.value.error) {
              // Only change to "Finished" if there is no error; otherwise, keep
              // last status.
              testProgressDialog.value.status = 'Finished'
            }
            testProgressDialog.value.result = report.data
            break
          case 'error':
            testProgressDialog.value.error = report.data
            break
        }
      }
    }

    backgroundPageConnection.onMessage.addListener(handleMessage)
    backgroundPageConnection.postMessage({
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: 'init',
    })

    /* Theme */
    const theme = ref<'light' | 'dark'>('light')

    const enableDarkTheme = (enabled: boolean) => {
      chrome.storage.local.set({
        darkThemeEnabled: enabled,
      })
      theme.value = enabled ? 'dark' : 'light'
    }

    const redrawScrollbar = () => {
      document.documentElement.className = `v-theme--${theme.value}`
      // force to redraw scrollbar
      document.documentElement.style.overflowY = 'hidden'
      document.documentElement.clientHeight.toString()
      document.documentElement.style.overflowY = 'scroll'
    }

    watch(theme, redrawScrollbar, { immediate: true })

    onMounted(async () => {
      const systemDarkModeEnabled = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      const preferences = (await chrome.storage.local.get({
        darkThemeEnabled: systemDarkModeEnabled,
      })) as Preferences
      theme.value = preferences.darkThemeEnabled ? 'dark' : 'light'
    })

    chrome.storage.onChanged.addListener(changes => {
      theme.value = changes.darkThemeEnabled.newValue ? 'dark' : 'light'
    })

    /* Headers */
    const addHeader = () => {
      request.value.headers.unshift({
        enabled: true,
        name: '',
        value: '',
        _createdAt: Date.now(),
      })
    }

    const deleteHeader = (index: number) => {
      request.value.headers.splice(index, 1)
    }

    /* Functionality */
    const getNamespaceByPath = (
      path: string,
      root: any,
      returnName: boolean,
    ) => {
      let namespace = root === undefined ? window : root

      const paths = path.split('.')
      for (let idx = 0; idx < paths.length - 1; idx++) {
        if (namespace[paths[idx]]) {
          namespace = namespace[paths[idx]]
        } else {
          return undefined
        }
      }

      if (returnName) {
        return {
          namespace: namespace,
          name: paths.pop()!,
        }
      } else {
        return namespace
      }
    }

    const applyFunction = async (
      func: string,
      insertWhenNoSelection = false,
      argument?: any,
    ) => {
      if (domFocusedInput === null) {
        return
      }

      let startIndex = domFocusedInput.selectionStart ?? 0
      let endIndex = domFocusedInput.selectionEnd ?? 0
      const textSelected = endIndex - startIndex !== 0
      const inputText = domFocusedInput.value

      if (argument === undefined) {
        if (textSelected) {
          argument = inputText.substring(startIndex, endIndex)
        } else if (insertWhenNoSelection) {
          argument = ''
        } else {
          argument = inputText
        }
      }

      const funcObj = getNamespaceByPath(func, window, true)
      let processed = argument
      try {
        processed = funcObj.namespace[funcObj.name](argument)
      } catch (error) {
        snackbar.value.text = (error as Error).message
        snackbar.value.show = true
      }

      await nextTick()

      domFocusedInput.focus()
      if (!textSelected && !insertWhenNoSelection) {
        startIndex = 0
        endIndex = inputText.length

        document.execCommand('selectAll')
      }

      document.execCommand('insertText', false, processed)

      domFocusedInput.setSelectionRange(
        startIndex + (textSelected ? 0 : processed.length),
        startIndex + processed.length,
      )
    }

    const openSqlInjectionPrompt = (func: string, positionRequired = true) => {
      sqlInjectionDialog.value.func = func
      sqlInjectionDialog.value.positionRequired = positionRequired
      sqlInjectionDialog.value.show = true
    }

    const openReverseShellPrompt = (func: string) => {
      reverseShellDialog.value.func = func
      reverseShellDialog.value.show = true
    }

    provide('applyFunction', applyFunction)
    provide('openSqlInjectionPrompt', openSqlInjectionPrompt)
    provide('openReverseShellPrompt', openReverseShellPrompt)

    /* Test */
    const controlTest = (action: string, script?: string, argument?: any) => {
      if (action === 'start') {
        testProgressDialog.value.percentage = 0
        testProgressDialog.value.status = ''
        testProgressDialog.value.error = ''
        testProgressDialog.value.result = null
        testProgressDialog.value.show = true
      }

      backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        type: 'test',
        data: { action, script, argument },
      })
    }

    provide('controlTest', controlTest)

    /* Misc */
    const onFocus = (event: FocusEvent) => {
      domFocusedInput = event.target as HTMLInputElement | null
    }

    const onScrollAppBar = (event: WheelEvent) => {
      appBar.value.$el.scrollLeft += event.deltaY
    }

    const getSupportedEnctype = () => {
      return [
        'application/x-www-form-urlencoded',
        'application/x-www-form-urlencoded (raw)',
        'multipart/form-data',
        'application/json',
      ]
    }

    const getCommonRequestHeaders = () => {
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
    }

    return {
      appBar,
      urlInput,

      theme,

      reloadDialog,
      sqlInjectionDialog,
      reverseShellDialog,
      testProgressDialog,
      snackbar,
      request,

      load,
      split,
      execute,
      addHeader,
      deleteHeader,
      enableDarkTheme,
      onFocus,
      onScrollAppBar,
      getSupportedEnctype,
      getCommonRequestHeaders,
    }
  },
})
</script>
