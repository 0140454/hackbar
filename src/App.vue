<template>
  <VApp>
    <VAppBar
      ref="appBar"
      density="compact"
      app
      flat
      @wheel.prevent="onScrollAppBar"
    >
      <VBtn variant="text" @click="load">Load</VBtn>
      <VDivider vertical inset />
      <VMenu>
        <template #activator="{ props }">
          <VBtn variant="text" v-bind="props" :class="$style.loadMoreActionBtn">
            <VIcon :icon="mdiMenuDown" />
          </VBtn>
        </template>
        <VList>
          <VListItem title="From tab (default)" @click="load" />
          <VListItem
            title="From cURL command"
            @click="requestLoaderDialog.show = true"
          />
        </VList>
      </VMenu>
      <VBtn variant="text" :disabled="isRawMode" @click="split">Split</VBtn>
      <VBtn variant="text" @click="execute">Execute</VBtn>
      <MenuTest />
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
          <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
            Mode
          </VBtn>
        </template>
        <VList>
          <VListItem title="Basic" @click="isRawMode = false" />
          <VListItem title="Raw" @click="isRawMode = true" />
        </VList>
      </VMenu>
      <VMenu>
        <template #activator="{ props }">
          <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
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
      <RequestPanelBasic v-if="!isRawMode" v-model="request" @focus="onFocus" />
      <RequestPanelRaw v-else v-model="request" @focus="onFocus" />
    </VMain>
    <DialogReloadPrompt v-model="reloadDialog" />
    <DialogRequestLoader
      v-if="requestLoaderDialog.show"
      v-model="requestLoaderDialog"
    />
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
</template>

<script lang="ts">
import { mdiMenuDown } from '@mdi/js'
import {
  defineComponent,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue'
import { VAppBar } from 'vuetify/components'
import { useTheme } from 'vuetify/framework'
import browser from 'webextension-polyfill'
import DialogReloadPrompt from './components/DialogReloadPrompt.vue'
import DialogRequestLoader from './components/DialogRequestLoader.vue'
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
import RequestPanelBasic from './components/RequestPanelBasic.vue'
import RequestPanelRaw from './components/RequestPanelRaw.vue'
import bodyProcessors from './processors'
import {
  ApplyFunctionKey,
  ControlTestKey,
  LoadFromKey,
  OpenReverseShellPromptKey,
  OpenSqlInjectionPromptKey,
} from './utils/constants'

type RuntimePort = Omit<browser.Runtime.Port, 'postMessage'> & {
  postMessage(message: BackgroundInitMessage): void
  postMessage(message: BackgroundLoadMessage): void
  postMessage(message: BackgroundExecuteMessage): void
  postMessage(message: BackgroundTestMessage): void
}

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
    DialogRequestLoader,
    RequestPanelBasic,
    RequestPanelRaw,
  },
  setup() {
    /* DOM element and refs */
    let domFocusedInput: HTMLInputElement | null = null
    const appBar = ref<InstanceType<typeof VAppBar>>()

    /* Dialog */
    const reloadDialog = ref({
      show: false,
    })
    const requestLoaderDialog = ref({
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
    const request = reactive<BrowseRequest>({
      method: 'GET',
      url: '',
      body: {
        content: '',
        enctype: bodyProcessors.getDefaultProcessorName(),
      },
      headers: [],
    })
    /* Mode */
    const isRawMode = ref(true)

    /* Communication */
    let backgroundPageConnection: RuntimePort | null = null

    const load = () => {
      backgroundPageConnection!.postMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
        type: 'load',
      })
    }

    const loadFrom = (source: BrowseRequest, overwriteHeaders = false) => {
      request.method = source.method
      request.url = source.url
      request.body = source.body
      if (overwriteHeaders) {
        request.headers = source.headers
      }
    }

    const split = () => {
      request.url = request.url.replace(/[^\n][?&#]/g, str => {
        return str[0] + '\n' + str[1]
      })

      request.body.content = bodyProcessors
        .find(request.body.enctype)!
        .format(request.body.content)
    }

    const execute = () => {
      if (request.url.length === 0) {
        return
      }

      backgroundPageConnection!.postMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
        type: 'execute',
        data: request,
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

        loadFrom(message.data)
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

    const connectToBackgroundPage = () => {
      backgroundPageConnection = browser.runtime.connect()
      backgroundPageConnection.onMessage.addListener(handleMessage)
      backgroundPageConnection.onDisconnect.addListener(connectToBackgroundPage)
      backgroundPageConnection.postMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
        type: 'init',
      })
    }

    connectToBackgroundPage()

    provide(LoadFromKey, loadFrom)

    /* Theme */
    const theme = useTheme()

    const enableDarkTheme = (enabled: boolean) => {
      browser.storage.local.set({
        darkThemeEnabled: enabled,
      })
      theme.global.name.value = enabled ? 'dark' : 'light'
    }

    const redrawScrollbar = () => {
      document.documentElement.className = `v-theme--${theme.global.name.value}`
      // force to redraw scrollbar
      document.documentElement.style.overflowY = 'hidden'
      document.documentElement.clientHeight.toString()
      document.documentElement.style.overflowY = 'scroll'
    }

    watch(theme.global.name, redrawScrollbar, { immediate: true })

    onMounted(async () => {
      const systemDarkModeEnabled = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      const preferences = (await browser.storage.local.get({
        darkThemeEnabled: systemDarkModeEnabled,
      })) as Preferences

      enableDarkTheme(preferences.darkThemeEnabled)
    })

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

    provide(ApplyFunctionKey, applyFunction)
    provide(OpenSqlInjectionPromptKey, openSqlInjectionPrompt)
    provide(OpenReverseShellPromptKey, openReverseShellPrompt)

    /* Test */
    const controlTest = (
      action: BackgroundTestMessage['data']['action'],
      script?: string,
      argument?: any,
    ) => {
      if (action === 'start') {
        testProgressDialog.value.percentage = 0
        testProgressDialog.value.status = ''
        testProgressDialog.value.error = ''
        testProgressDialog.value.result = null
        testProgressDialog.value.show = true
      }

      backgroundPageConnection!.postMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
        type: 'test',
        data: { action, script, argument },
      })
    }

    provide(ControlTestKey, controlTest)

    /* Events */
    const onFocus = (event: FocusEvent) => {
      domFocusedInput = event.target as HTMLInputElement | null
    }

    const onScrollAppBar = (event: WheelEvent) => {
      appBar.value!.$el.scrollLeft += event.deltaY
    }

    return {
      mdiMenuDown,

      appBar,

      theme,

      reloadDialog,
      requestLoaderDialog,
      sqlInjectionDialog,
      reverseShellDialog,
      testProgressDialog,
      snackbar,

      request,
      isRawMode,

      load,
      split,
      execute,
      enableDarkTheme,
      onFocus,
      onScrollAppBar,
    }
  },
})
</script>

<style lang="scss" module>
.loadMoreActionBtn {
  padding: 0;
  min-width: unset;
}
</style>
