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
        <VDivider vertical inset />
        <VMenu>
          <template #activator="{ props }">
            <VBtn
              variant="text"
              v-bind="props"
              :class="$style.loadMoreActionBtn"
            >
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
        <VBtn variant="text" @click="split">Split</VBtn>
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
              <div class="d-flex flex-wrap align-center">
                <VSwitch
                  ref="postEnabledSwitch"
                  v-model="request.body.enabled"
                  :class="$style.postSwitch"
                  :color="theme === 'dark' ? 'white' : 'black'"
                  label="Enable POST"
                  hide-details
                />
                <VSelect
                  v-show="request.body.enabled"
                  ref="enctypeSelect"
                  v-model="request.body.enctype"
                  :class="postControlWrapped ? 'pt-3' : ''"
                  density="compact"
                  :items="supportedEnctype"
                  label="enctype"
                  variant="underlined"
                  hide-details
                />
              </div>
              <VTextarea
                v-show="request.body.enabled"
                v-model="request.body.content"
                :class="postControlWrapped ? 'pt-3' : 'pt-1'"
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
                <VBtn @click="addHeader"> Modify Header </VBtn>
              </div>
              <div
                v-for="(header, index) in request.headers"
                :key="header._createdAt"
                class="d-flex align-baseline"
                :class="
                  index === 0
                    ? 'pt-3'
                    : request.headers[index - 1].value.length === 0
                    ? 'pt-2'
                    : 'pt-2'
                "
              >
                <VCheckboxBtn v-model="header.enabled" hide-details />
                <div class="d-flex flex-column flex-fill">
                  <div class="d-flex align-center">
                    <VCombobox
                      v-model="header.name"
                      :items="commonRequestHeaders"
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
                      :icon="mdiClose"
                      size="small"
                      variant="text"
                      @click="deleteHeader(index)"
                    />
                  </div>
                  <div class="pt-1">
                    <VChip
                      v-if="!header.value.length"
                      :prepend-icon="mdiSync"
                      size="small"
                      @click="
                        header.removeIfEmptyValue = !header.removeIfEmptyValue
                      "
                    >
                      Action:
                      {{
                        header.removeIfEmptyValue
                          ? 'Remove header'
                          : 'Send empty value'
                      }}
                    </VChip>
                  </div>
                </div>
              </div>
            </VCol>
          </VRow>
        </VContainer>
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
  </VThemeProvider>
</template>

<script lang="ts">
import { mdiClose, mdiMenuDown, mdiSync } from '@mdi/js'
import { defineComponent, nextTick, onMounted, provide, ref, watch } from 'vue'
import { VAppBar, VSelect, VSwitch, VTextarea } from 'vuetify'
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
import bodyProcessors from './processors'
import {
  ApplyFunctionKey,
  CommonRequestHeaders,
  ControlTestKey,
  LoadFromKey,
  OpenReverseShellPromptKey,
  OpenSqlInjectionPromptKey,
} from './utils/constants'

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
  },
  setup() {
    /* Constants */
    const supportedEnctype = bodyProcessors.getNames()
    const commonRequestHeaders =
      CommonRequestHeaders as unknown as Array<string>

    /* DOM element and refs */
    let domFocusedInput: HTMLInputElement | null = null
    const appBar = ref<InstanceType<typeof VAppBar>>()
    const urlInput = ref<InstanceType<typeof VTextarea>>()
    const postEnabledSwitch = ref<InstanceType<typeof VSwitch>>()
    const enctypeSelect = ref<InstanceType<typeof VSelect>>()

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
    const request = ref<BrowseRequest>({
      url: '',
      body: {
        content: '',
        enctype: bodyProcessors.getDefaultProcessorName(),
        enabled: false,
      },
      headers: [],
    })

    /* Communication */
    let backgroundPageConnection: browser.Runtime.Port | null = null

    const load = () => {
      backgroundPageConnection!.postMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
        type: 'load',
      })
    }

    const loadFrom = (source: BrowseRequest, overwriteHeaders = false) => {
      request.value.url = source.url
      request.value.body = source.body
      if (overwriteHeaders) {
        request.value.headers = source.headers
      }
    }

    const split = () => {
      request.value.url = request.value.url.replace(/[^\n][?&#]/g, str => {
        return str[0] + '\n' + str[1]
      })

      request.value.body.content = bodyProcessors
        .find(request.value.body.enctype)!
        .format(request.value.body.content)
    }

    const execute = () => {
      if (request.value.url.length === 0) {
        return
      }

      backgroundPageConnection!.postMessage({
        tabId: browser.devtools.inspectedWindow.tabId,
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

        loadFrom(message.data)
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
    const theme = ref<'light' | 'dark'>('light')

    const enableDarkTheme = (enabled: boolean) => {
      browser.storage.local.set({
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
      const preferences = (await browser.storage.local.get({
        darkThemeEnabled: systemDarkModeEnabled,
      })) as Preferences

      enableDarkTheme(preferences.darkThemeEnabled)
    })

    /* Headers */
    const addHeader = () => {
      request.value.headers.unshift({
        enabled: true,
        name: '',
        value: '',
        removeIfEmptyValue: true,
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

    provide(ApplyFunctionKey, applyFunction)
    provide(OpenSqlInjectionPromptKey, openSqlInjectionPrompt)
    provide(OpenReverseShellPromptKey, openReverseShellPrompt)

    /* Test */
    const controlTest = (action: string, script?: string, argument?: any) => {
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

    /* Misc */
    const postControlWrapped = ref(false)
    const enctypeResizeObserver = new ResizeObserver(() => {
      const selectRect: DOMRect =
        enctypeSelect.value.$el.getBoundingClientRect()
      const switchRect: DOMRect =
        postEnabledSwitch.value.$el.getBoundingClientRect()

      const selectCenter = selectRect.top + selectRect.height / 2
      const switchCenter = switchRect.top + switchRect.height / 2

      postControlWrapped.value = selectCenter != switchCenter
    })
    onMounted(() => {
      enctypeResizeObserver.observe(enctypeSelect.value.$el)
    })

    const onFocus = (event: FocusEvent) => {
      domFocusedInput = event.target as HTMLInputElement | null
    }

    const onScrollAppBar = (event: WheelEvent) => {
      appBar.value.$el.scrollLeft += event.deltaY
    }

    return {
      mdiClose,
      mdiMenuDown,
      mdiSync,

      supportedEnctype,
      commonRequestHeaders,

      appBar,
      urlInput,
      postEnabledSwitch,
      enctypeSelect,

      theme,

      reloadDialog,
      requestLoaderDialog,
      sqlInjectionDialog,
      reverseShellDialog,
      testProgressDialog,
      snackbar,
      request,

      postControlWrapped,

      load,
      split,
      execute,
      addHeader,
      deleteHeader,
      enableDarkTheme,
      onFocus,
      onScrollAppBar,
    }
  },
})
</script>

<style lang="scss" module>
.postSwitch :global .v-selection-control .v-label {
  width: unset;
}

.loadMoreActionBtn {
  padding: 0;
  min-width: unset;
}
</style>
