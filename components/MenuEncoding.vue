<template>
  <VMenu offset-y>
    <template #activator="{ on }">
      <VBtn text v-on="on">
        Encoding
        <VIcon small right>mdi-menu-down</VIcon>
      </VBtn>
    </template>
    <VList dense>
      <VListItem @click="applyFunction('Encode.URL.encode')">
        <VListItemTitle>URL encode</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Encode.URL.decode')">
        <VListItemTitle>URL decode</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Encode.URL.decodePlus')">
        <VListItemTitle>URL decode (+ => space)</VListItemTitle>
      </VListItem>
      <VDivider></VDivider>
      <VListItem @click="applyFunction('Encode.Base64.encode')">
        <VListItemTitle>Base64 encode</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Encode.Base64.decode')">
        <VListItemTitle>Base64 decode</VListItemTitle>
      </VListItem>
      <VDivider></VDivider>
      <VListItem @click="applyFunction('Encode.Hexadecimal.encode')">
        <VListItemTitle>Hexadecimal encode</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Encode.Hexadecimal.decode')">
        <VListItemTitle>Hexadecimal decode</VListItemTitle>
      </VListItem>
      <VDivider></VDivider>
      <VListItem @click="applyFunction('Encode.Unicode.encode')">
        <VListItemTitle>Unicode encode</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Encode.Unicode.decode')">
        <VListItemTitle>Unicode decode</VListItemTitle>
      </VListItem>
      <VDivider></VDivider>
      <VListItem @click="applyFunction('Encode.Escape.hex')">
        <VListItemTitle>Escape ASCII with hex</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Encode.Escape.oct')">
        <VListItemTitle>Escape ASCII with oct</VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<script>
import Vue from 'vue'
import {
  VBtn,
  VDivider,
  VIcon,
  VList,
  VListItem,
  VListItemTitle,
  VMenu,
} from 'vuetify/lib'

export default Vue.extend({
  name: 'MenuEncoding',
  components: {
    VBtn,
    VDivider,
    VIcon,
    VList,
    VListItem,
    VListItemTitle,
    VMenu,
  },
  inject: ['applyFunction'],
})
</script>
