<template>
  <VDialog v-model="shown" max-width="100%" :width="580" persistent>
    <VCard>
      <VCardTitle> Reverse shell </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="valid">
          Enter the address and port for the host that you want to connect to.
          <div class="d-flex pt-3">
            <VTextField
              v-model="result.host"
              v-disable-prevent-default.keydown
              label="Host"
              :rules="[v => !!v.length || 'Invalid host']"
              style="flex: 4 0"
              variant="underlined"
              autofocus
            />
            <VTextField
              v-model="result.port"
              v-disable-prevent-default.keydown
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
import { PropType, computed, defineComponent, inject, ref, toRefs } from 'vue'
import { VForm } from 'vuetify/components'
import { ApplyFunctionKey } from '../utils/constants'

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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const shown = computed<boolean>({
      set: value => {
        emit('update:modelValue', {
          ...modelValue.value,
          show: value,
        })
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

    const applyFunction = inject(ApplyFunctionKey)!
    const apply = () => {
      shown.value = false
      applyFunction(modelValue.value.func, true, result.value)
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
