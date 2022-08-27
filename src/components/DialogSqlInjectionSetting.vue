<template>
  <VDialog v-model="shown" max-width="100%" :width="580" persistent>
    <VCard>
      <VCardTitle> SQL injection </VCardTitle>
      <VCardText>
        <VForm ref="form" v-model="valid">
          <template v-if="modelValue.positionRequired">
            The number of columns must be
            <span class="font-weight-medium">larger than</span> or
            <span class="font-weight-medium">equal to</span> output position.
          </template>
          <template v-else>
            Enter the number of columns used in UNION SELECT statement.
          </template>
          <div class="d-flex pt-3">
            <VTextField
              v-model="result.columns"
              :min="result.position"
              label="The number of columns"
              :rules="[
                v =>
                  (/^[1-9][0-9]{0,}$/.test(v) &&
                    (!modelValue.positionRequired || v >= result.position)) ||
                  'Invalid value',
              ]"
              style="flex: 1 0"
              type="number"
              variant="underlined"
              autofocus
              required
            />
            <VTextField
              v-if="modelValue.positionRequired"
              v-model="result.position"
              class="pl-2"
              style="flex: 1 0"
              label="Output position"
              :max="result.columns"
              :min="1"
              :rules="[
                v =>
                  (/^[1-9][0-9]{0,}$/.test(v) && v <= result.columns) ||
                  'Invalid value',
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
import { VForm } from 'vuetify/components'
import { ApplyFunctionKey } from '../utils/constants'

export default defineComponent({
  name: 'DialogSqlInjectionSetting',
  props: {
    modelValue: {
      type: Object as PropType<{
        show: boolean
        positionRequired: boolean
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
      columns: 1,
      position: 1,
    })
    watch(
      () => {
        return `${modelValue.value.show}-${result.value.columns}-${result.value.position}`
      },
      () => {
        nextTick(() => form.value?.validate())
      },
    )

    const applyFunction = inject(ApplyFunctionKey)!
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
