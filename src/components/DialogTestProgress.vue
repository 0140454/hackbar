<template>
  <VDialog v-model="shown" max-width="100%" :width="580" persistent>
    <VCard>
      <VCardTitle> Test progress </VCardTitle>
      <VCardText>
        <div class="ellipsis">
          <template v-if="!modelValue.status">
            Waiting response from test script...
          </template>
          <template v-else>Status: {{ modelValue.status }}</template>
        </div>
        <div v-if="modelValue.error" class="ellipsis">
          Error: {{ modelValue.error }}
        </div>
        <VProgressLinear
          v-if="!modelValue.result"
          :model-value="modelValue.percentage"
          :indeterminate="!modelValue.percentage"
        />
        <VTable v-if="modelValue.result">
          <thead>
            <tr>
              <th
                v-for="(header, index) in modelValue.result.header"
                :key="`thead-${index}`"
                class="text-left"
              >
                {{ header.text }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in modelValue.result.data"
              :key="`tbody-${index}`"
            >
              <td
                v-for="(header, hIndex) in modelValue.result.header"
                :key="`item-${index}-${hIndex}`"
              >
                {{ item[header.value] }}
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          v-if="!modelValue.result"
          variant="text"
          @click="controlTest('toggle')"
        >
          Pause / Resume
        </VBtn>
        <VBtn
          v-if="!modelValue.result"
          variant="text"
          @click="controlTest('stop')"
        >
          Stop
        </VBtn>
        <VBtn v-if="modelValue.result" variant="text" @click="shown = false">
          Close
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, inject, toRefs } from 'vue'
import { ControlTestKey } from '../utils/constants'

export default defineComponent({
  name: 'DialogReloadPrompt',
  props: {
    modelValue: {
      type: Object as PropType<{
        show: boolean
        percentage: number
        status: string
        error: string
        result: TestResult | null
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

    const controlTest = inject(ControlTestKey)!

    return {
      shown,

      controlTest,
    }
  },
})
</script>
