<template>
  <VDialog v-model="shown" max-width="100%" :width="650" persistent>
    <VCard>
      <VCardTitle> Load request manually </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="valid">
          Paste your command or code for sending request here.<br />
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
            You can get command or code by right-clicking a request<br />
            in "Network" tab and then clicking "Copy as ..."
          </VTooltip>
          <div class="d-flex pt-3">
            <VTextarea
              v-model="userInput"
              label="Command or code"
              :rows="3"
              :rules="[v => !!v.length || 'Invalid command or code']"
              variant="underlined"
              required
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
import { VForm } from 'vuetify'
import {
  DEFAULT_ENCTYPE,
  LoadFromKey,
  SUPPORTED_ENCTYPE,
} from '../utils/constants'

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

    watch(userInput, () => {
      nextTick(() => form.value?.validate())
    })

    const loadFrom = inject(LoadFromKey)!
    const apply = async () => {
      const parsed = JSON.parse(
        await curlconverter.toJsonString(userInput.value),
      )

      const isPostMethod = parsed?.method.toLowerCase() !== 'get'

      let enctype = parsed?.headers?.['content-type']
        ?.split(';', 1)?.[0]
        ?.trim()
      if (!SUPPORTED_ENCTYPE.includes(enctype)) {
        enctype = DEFAULT_ENCTYPE
      }

      let content = parsed?.data ?? ''
      if (!isString(content)) {
        content = Object.entries(content)
          .map(e => e.join('='))
          .join('&')
      }

      const request: BrowseRequest = {
        url: parsed?.url,
        body: {
          enabled: isPostMethod,
          enctype,
          content,
        },
        headers: Object.entries<string>(parsed?.headers ?? {}).map(
          ([name, value], idx) => ({
            enabled: true,
            name,
            value,
            _createdAt: Date.now() * 1000 + idx,
          }),
        ),
      }

      loadFrom(request, true)
      shown.value = false
    }

    return {
      mdiInformation,

      shown,

      form,
      valid,
      userInput,

      apply,
    }
  },
})
</script>

<style lang="scss" module></style>
