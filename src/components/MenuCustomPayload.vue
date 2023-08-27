<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        Custom
      </VBtn>
    </template>
    <VList>
      <VListItem title="Manage" @click="openCustomPayloadManagement" />
      <VDivider v-if="customPayloadList.length > 0" />
      <VListItem
        v-for="(payload, index) in customPayloadList"
        :key="`${index}-${payload.name}`"
        :title="payload.name"
        @click="applyFunction('Payload.Custom.insert', true, payload.value)"
      />
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { mdiMenuDown } from '@mdi/js'
import { storeToRefs } from 'pinia'
import { defineComponent, inject } from 'vue'
import { useCustomPayloadStore } from '../stores'
import {
  ApplyFunctionKey,
  OpenCustomPayloadManagementKey,
} from '../utils/constants'

export default defineComponent({
  name: 'MenuCustomPayload',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!
    const openCustomPayloadManagement = inject(OpenCustomPayloadManagementKey)!

    const { data: customPayloadList } = storeToRefs(useCustomPayloadStore())

    return {
      mdiMenuDown,

      customPayloadList,

      applyFunction,
      openCustomPayloadManagement,
    }
  },
})
</script>
