<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        SSRF
      </VBtn>
    </template>
    <VList>
      <VListItem
        title="AWS - IAM role name"
        @click="applyFunction('Payload.SSRF.awsRoleName', true)"
      />
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { mdiMenuDown } from '@mdi/js'
import { defineComponent, inject } from 'vue'
import { ApplyFunctionKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuSsrf',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!

    return {
      mdiMenuDown,

      applyFunction,
    }
  },
})
</script>
