<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        Hashing
      </VBtn>
    </template>
    <VList>
      <VListItem title="MD5" @click="applyFunction('Hash.MD5.digest')" />
      <VListItem title="SHA1" @click="applyFunction('Hash.SHA1.digest')" />
      <VListItem title="SHA256" @click="applyFunction('Hash.SHA256.digest')" />
      <VListItem title="SHA384" @click="applyFunction('Hash.SHA384.digest')" />
      <VListItem title="SHA512" @click="applyFunction('Hash.SHA512.digest')" />
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { mdiMenuDown } from '@mdi/js'
import { defineComponent, inject } from 'vue'
import { ApplyFunctionKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuHashing',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!

    return {
      mdiMenuDown,

      applyFunction,
    }
  },
})
</script>
