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
            class="pl-2"
            label="Host"
            placeholder="example.com, example.com:8443, etc."
            variant="underlined"
            hide-details
            @focus="onFocus"
          />
        </div>
      </VCol>
      <VCol cols="12" md="6">
        <div style="padding: 11px 0 1px">
          <VBtn :elevation="2"> Render response </VBtn>
        </div>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12" md="6">
        <VTextarea
          v-model="rawRequest.content"
          label="Request"
          :rows="1"
          variant="underlined"
          :rules="[v => (!!v.length && !requestError.length) || requestError]"
          auto-grow
          @focus="onFocus"
        />
      </VCol>
      <VCol cols="12" md="6">
        <VTextarea
          v-model="response"
          label="Response (readonly)"
          :rows="1"
          variant="underlined"
          auto-grow
          hide-details
          readonly
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import httpZ from 'http-z'
import { PropType, defineComponent, reactive, ref, watch } from 'vue'
import bodyProcessors from '../processors'
import { BodyAvailableMethods } from '../utils/constants'

export default defineComponent({
  name: 'RequestPanelRaw',
  props: {
    modelValue: {
      type: Object as PropType<BrowseRequest>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'focus'],
  setup(props, { emit }) {
    const request = reactive(props.modelValue)
    watch(
      request,
      value => {
        emit('update:modelValue', value)
      },
      { deep: true },
    )

    /* Constants */
    const supportedScheme = ['HTTPS', 'HTTP']
    const defaultScheme = supportedScheme[0]

    /* Request / Response */
    const rawRequest = reactive({
      scheme: defaultScheme,
      host: '',
      content: '',
    })
    const requestError = ref('')
    const response = ref('')

    /* Converter */
    watch(
      props.modelValue,
      request => {
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

          if (!headers.find(({ name }) => name.toLowerCase() == 'host')) {
            headers.push({
              name: 'Host',
              value: parsedUrl.host,
            })
          }
          if (
            isBodyEnabled &&
            !headers.find(({ name }) => name.toLowerCase() == 'content-type')
          ) {
            let contentType = request.body.enctype
            const postInfo = bodyProcessors
              .findByContentType(contentType)!
              .parse(request.body.content)

            if (Object.keys(postInfo.contentTypeArguments).length) {
              contentType +=
                '; ' +
                Object.entries(postInfo.contentTypeArguments)
                  .map(([name, value]) => `${name}=${value}`)
                  .join('; ')
            }

            headers.push({
              name: 'Content-Type',
              value: contentType,
            })
          }

          rawRequest.scheme = supportedScheme.includes(scheme)
            ? scheme
            : defaultScheme
          rawRequest.host = parsedUrl.host
          rawRequest.content = httpZ.build({
            method: request.method,
            protocolVersion: 'HTTP/1.1',
            target: `${parsedUrl.pathname}${parsedUrl.search}`,
            host: parsedUrl.host,
            headers: headers,
            body: {
              text: isBodyEnabled ? request.body.content : '',
            },
          } as any)

          response.value = ''
          requestError.value = ''
        } catch (error) {
          requestError.value = (error as Error).message
        }
      },
      { deep: true, immediate: true },
    )

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
          requestError.value = (error as Error).message
        }
      },
      { deep: true },
    )

    /* Events */
    const onFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    return {
      supportedScheme,

      rawRequest,
      requestError,
      response,

      onFocus,
    }
  },
})
</script>

<style lang="scss" module></style>