<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        Encoding
      </VBtn>
    </template>
    <VList>
      <VListItem
        title="URL encode"
        @click="applyFunction('Encode.URL.encode')"
      />
      <VListItem
        title="URL encode (all characters)"
        @click="applyFunction('Encode.URL.encodeAllCharacters')"
      />
      <VListItem
        title="URL decode"
        @click="applyFunction('Encode.URL.decode')"
      />
      <VListItem @click="applyFunction('Encode.URL.decodePlusAsSpace')">
        <VListItemTitle> URL decode (+ <i>is</i> space) </VListItemTitle>
      </VListItem>
      <VDivider />
      <VListItem
        title="Base64 encode"
        @click="applyFunction('Encode.Base64.encode')"
      />
      <VListItem
        title="Base64 decode"
        @click="applyFunction('Encode.Base64.decode')"
      />
      <VDivider />
      <VListItem
        title="Hexadecimal encode"
        @click="applyFunction('Encode.Hexadecimal.encode')"
      />
      <VListItem
        title="Hexadecimal decode"
        @click="applyFunction('Encode.Hexadecimal.decode')"
      />
      <VDivider />
      <VListItem
        title="Unicode encode"
        @click="applyFunction('Encode.Unicode.encode')"
      />
      <VListItem
        title="Unicode decode"
        @click="applyFunction('Encode.Unicode.decode')"
      />
      <VDivider />
      <VListItem
        title="Escape ASCII with hex"
        @click="applyFunction('Encode.Escape.hex')"
      />
      <VListItem
        title="Escape ASCII with oct"
        @click="applyFunction('Encode.Escape.oct')"
      />
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { mdiMenuDown } from '@mdi/js'
import { defineComponent, inject } from 'vue'
import { ApplyFunctionKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuEncoding',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!

    return {
      mdiMenuDown,

      applyFunction,
    }
  },
})
</script>
