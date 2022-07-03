<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        LFI
      </VBtn>
    </template>
    <VList>
      <VListItem
        title="PHP wrapper - Base64"
        @click="applyFunction('Payload.LFI.phpWrapperBas64', true)"
      />
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { mdiMenuDown } from '@mdi/js'
import { defineComponent, inject } from 'vue'
import { ApplyFunctionKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuLfi',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!

    return {
      mdiMenuDown,

      applyFunction,
    }
  },
})
</script>
