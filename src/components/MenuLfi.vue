<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn append-icon="mdi-menu-down" variant="text" v-bind="props">
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
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'MenuLfi',
  setup() {
    const applyFunction = inject<any>('applyFunction')

    return {
      applyFunction,
    }
  },
})
</script>
