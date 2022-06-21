<template>
  <VDialog v-model="shown" max-width="100%" :width="580" persistent>
    <VCard>
      <VCardTitle> Reverse Shell </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="valid">
          It generates a payload to connecting to your host.
          <div class="d-flex pt-3">
            <VTextField
              v-model="result.host"
              label="Host"
              :rules="[v => v.length || 'Invalid host']"
              style="flex: 4 0"
              variant="underlined"
              required
            />
            <VTextField
              v-model="result.port"
              class="pl-2"
              style="flex: 1 0"
              label="Port"
              :max="65535"
              :min="1"
              :rules="[
                v =>
                  (/^[1-9][0-9]{0,}$/.test(v) && v <= 65535) || 'Invalid port',
              ]"
              type="number"
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

export default defineComponent({
  name: 'DialogReverseShellSetting',
  props: {
    modelValue: {
      type: Object as PropType<{
        show: boolean
        func: string
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
    const result = ref({
      host: '127.0.0.1',
      port: 1337,
    })
    watch(
      () => {
        return `${modelValue.value.show}-${result.value.host}-${result.value.port}`
      },
      () => {
        nextTick(() => form.value?.validate())
      },
    )

    const applyFunction = inject<any>('applyFunction')
    const apply = () => {
      applyFunction(modelValue.value.func, true, result.value)
      shown.value = false
    }

    return {
      shown,

      form,
      valid,
      result,

      apply,
    }
  },
})
</script>

<style lang="scss" module></style>