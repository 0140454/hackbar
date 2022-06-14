<template>
  <VMenu offset-y>
    <template #activator="{ on }">
      <VBtn text v-on="on">
        Hashing
        <VIcon small right>mdi-menu-down</VIcon>
      </VBtn>
    </template>
    <VList dense>
      <VListItem @click="applyFunction('Hash.MD5.digest')">
        <VListItemTitle>MD5</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Hash.SHA1.digest')">
        <VListItemTitle>SHA1</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Hash.SHA256.digest')">
        <VListItemTitle>SHA256</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Hash.SHA512.digest')">
        <VListItemTitle>SHA512</VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>

<script>
import Vue from 'vue'
import {
  VBtn,
  VIcon,
  VList,
  VListItem,
  VListItemTitle,
  VMenu,
} from 'vuetify/lib'

export default Vue.extend({
  name: 'MenuHashing',
  components: {
    VBtn,
    VIcon,
    VList,
    VListItem,
    VListItemTitle,
    VMenu,
  },
  inject: ['applyFunction'],
})
</script>
