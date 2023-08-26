<template>
  <VDialog v-model="shown" max-width="100%" :width="580" persistent>
    <VCard>
      <VCardTitle> Edit Custom Payload </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="valid">
          <div class="d-flex flex-column">
            <VTextField
              v-model="result.name"
              v-disable-prevent-default.keydown
              label="Name"
              :rules="[v => !!v.length || 'Invalid name']"
              variant="underlined"
              autofocus
              required
            />
            <VTextarea
              v-model="result.value"
              v-disable-prevent-default.keydown
              class="monospaced"
              label="Payload"
              :rules="[v => !!v.length || 'Invalid payload']"
              :rows="1"
              variant="underlined"
              auto-grow
            />
          </div>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="shown = false"> Cancel </VBtn>
        <VBtn
          variant="text"
          :disabled="!valid"
          @click="
            () => {
              $emit('save', result)
              shown = false
            }
          "
        >
          OK
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash'
import {
  PropType,
  computed,
  defineComponent,
  nextTick,
  ref,
  toRefs,
  watch,
} from 'vue'
import { VForm } from 'vuetify/components'

export default defineComponent({
  name: 'DialogCustomPayloadEdit',
  props: {
    modelValue: {
      type: Object as PropType<{
        show: boolean
        payload: CustomPayload
      }>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'save'],
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
    const result = ref<CustomPayload>(cloneDeep(modelValue.value.payload))
    watch(
      () => {
        return `${result.value.name}-${result.value.value}`
      },
      () => {
        nextTick(() => form.value?.validate())
      },
    )

    return {
      shown,

      form,
      valid,
      result,
    }
  },
})
</script>

<style lang="scss" module></style>
