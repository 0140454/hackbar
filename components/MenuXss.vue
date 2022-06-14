<template>
  <VMenu offset-y>
    <template #activator="{ on }">
      <VBtn text v-on="on">
        XSS
        <VIcon small right>mdi-menu-down</VIcon>
      </VBtn>
    </template>
    <VList dense>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>Vue.js</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="applyFunction('Payload.XSS.Vue.vue2Interpolation', true)"
          >
            <VListItemTitle>Vue 2 - Interpolation</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.XSS.Vue.vue2Directive', true)"
          >
            <VListItemTitle>Vue 2 - Directive</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.XSS.Vue.vue3Interpolation', true)"
          >
            <VListItemTitle>Vue 3 - Interpolation</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.XSS.Vue.vue3DynamicComponent', true)"
          >
            <VListItemTitle>Vue 3 - Dynamic Component</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle> Angular.js for strict CSP </VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="
              applyFunction(
                'Payload.XSS.AngularJS.angularJS1_6WithPrototype$on',
                true,
              )
            "
          >
            <VListItemTitle>
              AngularJS >= 1.6 with Prototype Library
            </VListItemTitle>
          </VListItem>
          <VListItem
            @click="
              applyFunction('Payload.XSS.AngularJS.angularJSWith$event', true)
            "
          >
            <VListItemTitle>
              AngularJS All Version (Chrome Only)
            </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>CTF Snippets</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="applyFunction('Payload.XSS.snippets.getSamesiteFlag', true)"
          >
            <VListItemTitle>Get flag from '/flag'</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.XSS.snippets.getCookieFlag', true)"
          >
            <VListItemTitle>Get flag from document.cookie</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.XSS.snippets.getStorageFlag', true)"
          >
            <VListItemTitle> Get flag from localStorage.flag </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>HTML</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem @click="applyFunction('Encode.Html.encode2Hex')">
            <VListItemTitle>Encode using hex</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Encode.Html.encode2Dec')">
            <VListItemTitle>Encode using dec</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Encode.Html.encode2EntityName')">
            <VListItemTitle>Encode using entity name</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Encode.Html.decodeFromHex')">
            <VListItemTitle>Decode using hex</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Encode.Html.decodeFromDec')">
            <VListItemTitle>Decode using dec</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Encode.Html.decodeFromEntityName')">
            <VListItemTitle>Decode using entity name</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>String.fromCharCode</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem @click="applyFunction('Encode.CharCode.encode')">
            <VListItemTitle>Encode</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Encode.CharCode.decode')">
            <VListItemTitle>Decode</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VListItem @click="applyFunction('Payload.XSS.polyglot', true)">
        <VListItemTitle>Polyglot</VListItemTitle>
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
  VListItemAction,
  VListItemTitle,
  VMenu,
} from 'vuetify/lib'

export default Vue.extend({
  name: 'MenuXss',
  components: {
    VBtn,
    VIcon,
    VList,
    VListItem,
    VListItemAction,
    VListItemTitle,
    VMenu,
  },
  inject: ['applyFunction'],
})
</script>
