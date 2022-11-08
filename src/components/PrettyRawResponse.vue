<template>
  <div :class="$style.root">
    <VInput
      class="monospaced"
      :class="themeName === 'dark' ? $style.dark : $style.light"
      :hide-details="hideDetails"
      :messages="messages"
    >
      <VField
        :label="label"
        :variant="variant"
        :active="isActive"
        :focused="isFocused"
      >
        <pre
          ref="_contenteditable"
          class="v-field__input"
          :class="$style.contenteditable"
          spellcheck="false"
          contenteditable
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
          @cut.prevent
          @paste.prevent
          v-html="html"
        />
      </VField>
    </VInput>
    <div
      v-if="response"
      :class="$style.tools"
      class="d-flex flex-column align-end"
    >
      <div>
        <VBtn
          variant="plain"
          icon
          @click="searchOptions.enabled = !searchOptions.enabled"
        >
          <VIcon :icon="mdiFileSearchOutline" />
          <VTooltip location="top" activator="parent"> Search </VTooltip>
        </VBtn>
        <VBtn variant="plain" icon @click="$emit('render')">
          <VIcon :icon="mdiMonitorDashboard" />
          <VTooltip location="top" activator="parent"> Render </VTooltip>
        </VBtn>
      </div>
      <VToolbar
        v-show="searchOptions.enabled"
        class="w-100"
        density="compact"
        :elevation="1"
        floating
        rounded
      >
        <VTextField
          v-model="searchOptions.keyword"
          class="ml-2 monospaced"
          :class="$style.searchInput"
          density="compact"
          :suffix="searchInputSuffix"
          variant="plain"
          single-line
          hide-details
        />
        <VDivider inset vertical />
        <VBtn
          class="ml-1"
          density="comfortable"
          :disabled="!searchResult.ranges.length"
          size="small"
          :icon="mdiChevronUp"
          @click="
            searchResult.current =
              (searchResult.current - 1 + searchResult.ranges.length) %
              searchResult.ranges.length
          "
        />
        <VBtn
          density="comfortable"
          :disabled="!searchResult.ranges.length"
          size="small"
          :icon="mdiChevronDown"
          @click="
            searchResult.current =
              (searchResult.current + 1 + searchResult.ranges.length) %
              searchResult.ranges.length
          "
        />
        <VBtn
          :class="{ 'v-btn--active': searchOptions.caseSensitive }"
          density="comfortable"
          size="small"
          :icon="mdiFormatLetterCase"
          @click="searchOptions.caseSensitive = !searchOptions.caseSensitive"
        />
        <VBtn
          :class="{ 'v-btn--active': searchOptions.regexp }"
          density="comfortable"
          size="small"
          :icon="mdiRegex"
          @click="searchOptions.regexp = !searchOptions.regexp"
        />
        <VBtn
          class="mr-1"
          density="comfortable"
          size="small"
          :icon="mdiClose"
          @click="searchOptions.enabled = !searchOptions.enabled"
        />
      </VToolbar>
    </div>
  </div>
</template>

<script lang="ts">
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiFileSearchOutline,
  mdiFormatLetterCase,
  mdiMonitorDashboard,
  mdiRegex,
} from '@mdi/js'
import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import http from 'highlight.js/lib/languages/http'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import httpZ from 'http-z'
import escapeRegExp from 'lodash/escapeRegExp'
import {
  PropType,
  computed,
  defineComponent,
  nextTick,
  reactive,
  ref,
  watch,
} from 'vue'
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
    label: {
      type: String,
      default: '',
    },
    variant: {
      type: String as PropType<
        'filled' | 'outlined' | 'plain' | 'underlined' | 'solo'
      >,
      default: 'filled',
    },
    response: {
      type: undefined as unknown as PropType<BrowseResponse | undefined>,
      required: true,
    },
    messages: {
      type: [Array, String] as PropType<string | string[]>,
      default: () => [],
    },
    hideDetails: {
      type: [Boolean, String] as PropType<boolean | 'auto'>,
      default: false,
    },
  },
  emits: ['render'],
  setup(props) {
    const theme = useTheme()

    /* DOM element and refs */
    const _contenteditable = ref<HTMLPreElement>()

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

    /* Search */
    const searchOptions = reactive({
      enabled: false,
      keyword: '',
      caseSensitive: false,
      regexp: false,
    })
    const searchResult = reactive({
      current: 0,
      ranges: [] as Array<Range>,
    })
    const searchInputSuffix = computed(() => {
      if (!searchOptions.keyword.length) {
        return ''
      } else if (!searchResult.ranges.length) {
        return '0/0'
      }

      return `${searchResult.current + 1}/${searchResult.ranges.length}`
    })

    const selectCurrentResult = () => {
      const selection = document.getSelection()!

      selection.removeAllRanges()
      if (searchResult.ranges.length) {
        // XXX: cast to Range for type checking
        selection.addRange(searchResult.ranges[searchResult.current] as Range)
      }
    }
    const performSearch = () => {
      if (!searchOptions.keyword.length) {
        searchResult.current = 0
        searchResult.ranges = []
        return
      }

      const pattern = searchOptions.regexp
        ? searchOptions.keyword
        : escapeRegExp(searchOptions.keyword)
      const flags = ['g', searchOptions.caseSensitive ? '' : 'i'].join('')
      const regexp = new RegExp(pattern, flags)

      const offsets = [
        ..._contenteditable.value!.innerText.matchAll(regexp),
      ].map(m => {
        return {
          start: m.index!,
          end: m.index! + m[0].length,
        }
      })
      const walker = document.createTreeWalker(
        _contenteditable.value!,
        NodeFilter.SHOW_TEXT,
      )

      const results = offsets.map(() => {
        const range = document.createRange()
        range.setStart(_contenteditable.value!, 0)
        range.collapse(true)

        return {
          startFound: false,
          range,
        }
      })

      let currentOffset = 0
      let finishedResultsIndex = -1
      let node: Node | null
      while ((node = walker.nextNode())) {
        const textStart = currentOffset
        const textEnd = textStart + (node as Text).length

        for (let idx = finishedResultsIndex + 1; idx < results.length; idx++) {
          const record = results[idx]
          const resultStart = offsets[idx].start
          const resultEnd = offsets[idx].end

          if (resultStart > textEnd) {
            break
          }

          if (
            !record.startFound &&
            resultStart >= textStart &&
            resultStart <= textEnd
          ) {
            record.range.setStart(node!, resultStart - textStart)
            record.startFound = true
          }
          if (
            record.startFound &&
            resultEnd >= textStart &&
            resultEnd <= textEnd
          ) {
            record.range.setEnd(node!, resultEnd - textStart)

            if (finishedResultsIndex + 1 === idx) {
              finishedResultsIndex = idx
            }
          }
        }

        currentOffset = textEnd
      }

      searchResult.current = 0
      searchResult.ranges = results.map(result => result.range)
    }

    watch(
      () => searchOptions,
      newOptions => {
        if (!newOptions.enabled) {
          return
        }

        performSearch()
        selectCurrentResult()
      },
      { deep: true },
    )
    watch(
      () => searchResult.current,
      () => {
        nextTick(selectCurrentResult)
      },
    )

    /* Events */
    const onFocus = () => {
      isFocused.value = true
    }
    const onBlur = () => {
      isFocused.value = false
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        event.preventDefault()
      }
    }

    return {
      mdiChevronDown,
      mdiChevronUp,
      mdiClose,
      mdiFileSearchOutline,
      mdiFormatLetterCase,
      mdiMonitorDashboard,
      mdiRegex,

      _contenteditable,

      isActive,
      isFocused,

      themeName: theme.global.name,

      html,

      searchOptions,
      searchResult,
      searchInputSuffix,

      onFocus,
      onBlur,
      onKeydown,
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
.root {
  position: relative;
}
.tools {
  max-width: 380px;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
}
.searchInput {
  min-width: 70px;
  width: 100%;

  :global {
    .v-field__field {
      align-items: center;
    }
    .v-field__input {
      line-height: 16px;
      padding: 0;
    }
    .v-text-field__suffix {
      line-height: 17px;
      padding: 0 8px 0 12px;
    }
  }
}
.contenteditable {
  caret-color: transparent;
  display: block;
  height: fit-content;
  outline: 0px solid transparent;
  white-space: pre-wrap;
}
</style>
