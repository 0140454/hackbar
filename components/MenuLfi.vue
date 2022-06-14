<template>
  <VMenu offset-y>
    <template #activator="{ on }">
      <VBtn text v-on="on">
        LFI
        <VIcon small right>mdi-menu-down</VIcon>
      </VBtn>
    </template>
    <VList dense>
      <VListItem @click="applyFunction('Payload.LFI.phpWrapperBas64', true)">
        <VListItemTitle>PHP wrapper - Base64</VListItemTitle>
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
  name: 'MenuLfi',
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
