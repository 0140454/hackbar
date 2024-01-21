<template>
  <VDialog v-model="shown" max-width="100%" :width="680" persistent>
    <VCard>
      <VCardTitle> Load request manually </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="valid">
          Paste your cURL command for sending request here.<br />
          It will be parsed and used to overwrite current URL, body and headers
          settings.
          <VTooltip location="bottom start">
            <template #activator="{ props }">
              <VIcon
                class="text-disabled"
                :icon="mdiInformation"
                size="small"
                v-bind="props"
              />
            </template>
            You can get a command by right-clicking a request<br />
            in "Network" tab and then clicking "Copy as cURL"
          </VTooltip>
          <div class="d-flex pt-3">
            <VTextarea
              v-model="userInput"
              v-disable-prevent-default.keydown
              class="monospaced"
              label="Command"
              :rows="3"
              :rules="[v => !v.length || !parsingError.length || parsingError]"
              variant="underlined"
              auto-grow
              autofocus
            />
          </div>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="shown = false"> Cancel </VBtn>
        <VBtn variant="text" :disabled="!valid" @click="apply"> OK </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script lang="ts">
import { mdiInformation } from '@mdi/js'
import * as curlconverter from 'curlconverter'
import isString from 'lodash/isString'
import {
  PropType,
  computed,
  defineComponent,
  inject,
  nextTick,
  ref,
  toRefs,
  watch,
} from 'vue'
import { VForm } from 'vuetify/components'
import bodyProcessors from '../processors'
import UrlencodedFormDataProcessor from '../processors/implementations/1-application-x-www-form-urlencoded'
import JsonProcessor from '../processors/implementations/3-application-json'
import { LoadFromKey } from '../utils/constants'

export default defineComponent({
  name: 'DialogRequestLoader',
  props: {
    modelValue: {
      type: Object as PropType<{
        show: boolean
      }>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const shown = computed<boolean>({
      set: value => {
        emit(
          'update:modelValue',
          Object.assign({}, modelValue.value, { show: value }),
        )
      },
      get: () => {
        return modelValue.value.show
      },
    })

    const form = ref<InstanceType<typeof VForm>>()
    const valid = ref(false)
    const userInput = ref('')
    const parsingError = ref('')
    let parsed: any = undefined

    watch(userInput, () => {
      nextTick(async () => {
        try {
          parsed = JSON.parse(await curlconverter.toJsonString(userInput.value))

          parsingError.value = ''
        } catch (err) {
          parsingError.value = (err as Error).message
        }

        form.value?.validate()
      })
    })

    const loadFrom = inject(LoadFromKey)!
    const apply = async () => {
      // find processor
      const contentTypeHeader = Object.entries<string>(
        parsed?.headers ?? {},
      ).find(([name, _]) => {
        return name.toLowerCase() === 'content-type'
      }) ?? [
        'content-type',
        bodyProcessors.getDefaultProcessorHttpContentType(),
      ]

      const contentTypeName = contentTypeHeader[0]
      const contentTypeValue = contentTypeHeader[1].split(';', 1)[0].trim()

      const processor =
        bodyProcessors.findByContentType(contentTypeValue) ??
        bodyProcessors.getDefaultProcessor()

      if (
        processor.getHttpContentType() === contentTypeValue &&
        parsed?.headers &&
        contentTypeName in parsed.headers
      ) {
        delete parsed.headers[contentTypeName]
      }
      // convert request body
      let content = parsed?.data ?? ''
      if (!isString(content)) {
        const dataEntries = Object.entries<string>(content)

        if (processor instanceof UrlencodedFormDataProcessor) {
          content = dataEntries.map(e => e.join('=')).join('&')
        } else if (processor instanceof JsonProcessor) {
          content = JSON.stringify(content)
        } else {
          content = dataEntries[0].join('')
        }
      }
      // convert to BrowseRequest
      const request: BrowseRequest = {
        method: parsed?.method.toUpperCase() ?? 'GET',
        url: parsed?.url,
        body: {
          enctype: processor.getName(),
          content,
        },
        headers: Object.entries<string>(parsed?.headers ?? {}).map(
          ([name, value], idx) => ({
            enabled: true,
            name,
            value,
            removeIfEmptyValue: true,
            _createdAt: Date.now() * 1000 + idx,
          }),
        ),
        followRedirect: false,
      }

      shown.value = false
      loadFrom(request)
    }

    return {
      mdiInformation,

      shown,

      form,
      valid,
      userInput,
      parsingError,

      apply,
    }
  },
})
</script>
