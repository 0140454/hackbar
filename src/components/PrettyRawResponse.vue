<template>
  <VInput
    class="monospaced"
    :class="themeName === 'dark' ? $style.dark : $style.light"
  >
    <VField v-bind="$attrs" :active="isActive" :focused="isFocused">
      <pre
        class="v-field__input"
        :class="$style.contenteditable"
        spellcheck="false"
        contenteditable
        @paste="onEdit"
        @keydown="onEdit"
        @focus="onFocus"
        @blur="onBlur"
        @cut="onEdit"
        v-html="html"
      />
    </VField>
  </VInput>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import http from 'highlight.js/lib/languages/http'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import httpZ from 'http-z'
import { PropType, computed, defineComponent, ref } from 'vue'
import { useTheme } from 'vuetify/framework'
import { generateRandomHexString } from '../utils/functions'

hljs.registerLanguage('css', css)
hljs.registerLanguage('http', http)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)

export default defineComponent({
  name: 'PrettyRawResponse',
  inheritAttrs: false,
  props: {
    response: {
      type: undefined as unknown as PropType<BrowseResponse | undefined>,
      required: true,
    },
  },
  setup(props) {
    const theme = useTheme()

    /* State */
    const isFocused = ref(false)
    const isDirty = computed(() => !!props.response)
    const isActive = computed(() => isFocused.value || isDirty.value)

    /* Response */
    const html = computed(() => {
      const reasonPhrasePlaceholder = generateRandomHexString(16)
      const bodyPlaceholder = generateRandomHexString(16)

      if (!props.response) {
        return ''
      }

      const prettyBody = hljs.highlightAuto(props.response.body, [
        'css',
        'javascript',
        'json',
        'xml',
      ]).value
      const builtResponse = httpZ
        .build({
          protocolVersion: props.response.protocolVersion,
          statusCode: props.response.statusCode,
          statusMessage:
            props.response.statusMessage || reasonPhrasePlaceholder,
          headers: props.response.headers,
          body: {
            text: bodyPlaceholder,
          },
        } as any)
        .replace(` ${reasonPhrasePlaceholder}`, '')

      return hljs
        .highlight(builtResponse, {
          language: 'http',
          ignoreIllegals: true,
        })
        .value.replace(bodyPlaceholder, prettyBody)
    })

    /* Events */
    const onEdit = (event: ClipboardEvent | KeyboardEvent) => {
      event.preventDefault()
    }
    const onFocus = () => {
      isFocused.value = true
    }
    const onBlur = () => {
      isFocused.value = false
    }

    return {
      isActive,
      isFocused,

      html,

      themeName: theme.global.name,

      onEdit,
      onFocus,
      onBlur,
    }
  },
})
</script>

<style lang="scss" module>
.light :global {
  @import 'highlight.js/scss/github.scss';
}
.dark :global {
  @import 'highlight.js/scss/github-dark.scss';
}
.contenteditable {
  caret-color: transparent;
  display: block;
  height: fit-content;
  outline: 0px solid transparent;
}
.sizer {
  display: block;
  left: 0;
  position: absolute;
  top: 0;
  visibility: hidden;
}
</style>
