<template>
  <VContainer fluid>
    <VRow>
      <VCol cols="12" md="6">
        <div class="d-flex">
          <VSelect
            v-model="rawRequest.scheme"
            :items="supportedScheme"
            label="Scheme"
            style="max-width: 95px"
            variant="underlined"
            hide-details
          />
          <VTextField
            v-model="rawRequest.host"
            class="pl-2 monospaced"
            label="Host"
            placeholder="example.com, example.com:8443, etc."
            variant="underlined"
            hide-details
            @blur="onBlur"
            @focus="onFocus"
          />
        </div>
      </VCol>
      <VCol cols="12" md="6">
        <div class="d-flex fill-height align-end" :class="$style.switchArea">
          <VSwitch
            v-model="request.followRedirect"
            class="flex-grow-0"
            :color="themeName === 'dark' ? 'white' : 'black'"
            label="Follow redirection"
            hide-details
          />
          <VSwitch
            v-model="isAutoRenderEnabled"
            class="flex-grow-0"
            :color="themeName === 'dark' ? 'white' : 'black'"
            label="Render automatically"
            hide-details
          />
        </div>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12" md="6">
        <VTextarea
          ref="rawRequestInput"
          v-model="rawRequest.content"
          class="monospaced"
          :hint="
            [
              'Protocol version in the editor will be fixed to HTTP/1.1, but it is actually decided by fetch API.',
              'Furthermore, due to Chrome implementation, it always shows HTTP/1.1 in Response if used version is higher than or equal to HTTP/2.',
            ].join(' ')
          "
          label="Request"
          persistent-hint
          :rows="1"
          variant="underlined"
          :rules="[
            v => !v.length || !rawRequestError.length || rawRequestError,
          ]"
          auto-grow
          @blur="onBlur"
          @focus="onFocus"
        />
      </VCol>
      <VCol :class="$style.responseArea" cols="12" md="6">
        <PrettyRawResponse
          label="Response"
          variant="underlined"
          :response="response"
          hide-details
        />
        <VBtn
          v-if="response && !isAutoRenderEnabled"
          :class="$style.renderBtn"
          variant="plain"
          @click="renderResponse"
        >
          Render
        </VBtn>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import httpZ from 'http-z'
import { PropType, defineComponent, nextTick, reactive, ref, watch } from 'vue'
import { VTextarea } from 'vuetify/components'
import { useTheme } from 'vuetify/framework'
import bodyProcessors from '../processors'
import { BodyAvailableMethods } from '../utils/constants'
import PrettyRawResponse from './PrettyRawResponse.vue'

export default defineComponent({
  name: 'RequestPanelRaw',
  components: {
    PrettyRawResponse,
  },
  props: {
    modelValue: {
      type: Object as PropType<BrowseRequest>,
      required: true,
    },
    response: {
      type: undefined as unknown as PropType<BrowseResponse | undefined>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'focus', 'render'],
  setup(props, { emit }) {
    const request = reactive(props.modelValue)
    watch(
      request,
      value => {
        emit('update:modelValue', value)
      },
      { deep: true },
    )

    const theme = useTheme()

    /* Constants */
    const supportedScheme = ['HTTPS', 'HTTP']
    const defaultScheme = supportedScheme[0]

    /* DOM element and refs */
    const rawRequestInput = ref<InstanceType<typeof VTextarea>>()

    /* Request */
    const rawRequest = reactive({
      scheme: defaultScheme,
      host: '',
      content: '',
    })
    const rawRequestError = ref('')

    /* Converter */
    let isEditing = false

    const requestWatcher = (request: BrowseRequest) => {
      if (!request.url.trim()) {
        return
      }

      try {
        const parsedUrl = new URL(request.url)
        const headers = request.headers
          .filter(({ enabled }) => enabled)
          .map(({ name, value }) => ({ name, value }))
        const isBodyEnabled = BodyAvailableMethods.includes(request.method)
        const scheme = parsedUrl.protocol.slice(0, -1).toUpperCase()

        const builtRawRequest = httpZ.build({
          method: request.method,
          protocolVersion: 'HTTP/1.1',
          target: `${parsedUrl.pathname}${parsedUrl.search}`,
          host: parsedUrl.host,
          headers,
          body: {
            text: isBodyEnabled ? request.body.content : '',
          },
        } as any)

        if (!isEditing) {
          rawRequest.scheme = supportedScheme.includes(scheme)
            ? scheme
            : defaultScheme
          rawRequest.host = parsedUrl.host
          rawRequest.content = builtRawRequest
        }

        rawRequestError.value = ''
      } catch (error) {
        rawRequestError.value = (error as Error).message
      }
    }
    watch(props.modelValue, requestWatcher, { deep: true, immediate: true })

    watch(
      rawRequest,
      newRawRequest => {
        try {
          const requestContent = newRawRequest.content
            .replaceAll('\r\n', '\n')
            .split('\n')
            .join('\r\n')
          const model = httpZ.parse(requestContent) as httpZ.HttpZRequestModel
          const contentType =
            model.headers?.find(
              ({ name }) => name.toLowerCase() === 'content-type',
            )?.value ?? ''
          const doubleCrlfIndex = requestContent.indexOf('\r\n\r\n')
          const bodyText =
            doubleCrlfIndex >= 0
              ? requestContent.slice(doubleCrlfIndex + 4)
              : ''

          request.method = model.method.toUpperCase()
          request.url = new URL(
            model.target,
            `${newRawRequest.scheme}://${newRawRequest.host}`,
          ).toString()
          request.body.content = bodyText ?? ''
          request.body.enctype =
            bodyProcessors.findByContentType(contentType)?.getName() ??
            bodyProcessors.getDefaultProcessorName()

          const headers = model.headers ?? []
          request.headers.forEach(header => {
            header.enabled = false
          })
          headers.forEach((header, idx) => {
            const rh = request.headers.find(
              rh => rh.name.toLowerCase() === header.name.toLowerCase(),
            )
            if (!rh) {
              request.headers.push({
                enabled: true,
                name: header.name,
                value: header.value ?? '',
                removeIfEmptyValue: false,
                _createdAt: Date.now() * 1000 + idx,
              })
            } else {
              rh.enabled = true
              rh.value = header.value ?? ''
            }
          })
        } catch (error) {
          rawRequestError.value = (error as Error).message
        }
      },
      { deep: true },
    )

    /* Functionality */
    const isAutoRenderEnabled = ref(true)

    const renderResponse = () => {
      emit('render')
    }

    watch(
      () => props.response,
      () => {
        if (!isAutoRenderEnabled.value) {
          return
        }

        renderResponse()
      },
    )

    /* Events */
    const onBlur = () => {
      isEditing = false
      requestWatcher(props.modelValue)
    }

    const onFocus = (event: FocusEvent) => {
      isEditing = true
      emit('focus', event)
    }

    /* Misc */
    const focus = () => {
      nextTick(() => {
        const dom =
          rawRequestInput.value!.$el.getElementsByTagName('textarea')[0]
        dom.setSelectionRange(0, 0)
        dom.focus()
      })
    }

    return {
      supportedScheme,

      rawRequestInput,

      request,
      rawRequest,
      rawRequestError,

      isAutoRenderEnabled,
      themeName: theme.global.name,

      renderResponse,

      onFocus,
      onBlur,

      focus,
    }
  },
})
</script>

<style lang="scss" module>
.switchArea {
  flex-wrap: wrap;
  gap: 16px;
}
.responseArea {
  position: relative;
}
.renderBtn {
  position: absolute;
  right: 12px;
  top: 22px;
}
</style>
