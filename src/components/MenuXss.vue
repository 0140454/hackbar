<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        XSS
      </VBtn>
    </template>
    <VList>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="Vue.js"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Vue 2 - Interpolation"
            @click="applyFunction('Payload.XSS.Vue.vue2Interpolation', true)"
          />
          <VListItem
            title="Vue 2 - Directive"
            @click="applyFunction('Payload.XSS.Vue.vue2Directive', true)"
          />
          <VListItem
            title="Vue 3 - Interpolation"
            @click="applyFunction('Payload.XSS.Vue.vue3Interpolation', true)"
          />
          <VListItem
            title="Vue 3 - Dynamic Component"
            @click="applyFunction('Payload.XSS.Vue.vue3DynamicComponent', true)"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="Angular.js for strict CSP"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="AngularJS >= 1.6 with Prototype Library"
            @click="
              applyFunction(
                'Payload.XSS.AngularJS.angularJS1_6WithPrototype$on',
                true,
              )
            "
          />
          <VListItem
            title="AngularJS All Version (Chrome Only)"
            @click="
              applyFunction('Payload.XSS.AngularJS.angularJSWith$event', true)
            "
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="CTF Snippets"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Get flag from '/flag'"
            @click="applyFunction('Payload.XSS.snippets.getSamesiteFlag', true)"
          />
          <VListItem
            title="Get flag from document.cookie"
            @click="applyFunction('Payload.XSS.snippets.getCookieFlag', true)"
          />
          <VListItem
            title="Get flag from localStorage.flag"
            @click="applyFunction('Payload.XSS.snippets.getStorageFlag', true)"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="HTML"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Encode with hex"
            @click="applyFunction('Encode.Html.encode2Hex')"
          />
          <VListItem
            title="Encode with dec"
            @click="applyFunction('Encode.Html.encode2Dec')"
          />
          <VListItem
            title="Encode with entity name"
            @click="applyFunction('Encode.Html.encode2EntityName')"
          />
          <VListItem
            title="Decode with hex"
            @click="applyFunction('Encode.Html.decodeFromHex')"
          />
          <VListItem
            title="Decode with dec"
            @click="applyFunction('Encode.Html.decodeFromDec')"
          />
          <VListItem
            title="Decode with entity name"
            @click="applyFunction('Encode.Html.decodeFromEntityName')"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="String.fromCharCode"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Encode"
            @click="applyFunction('Encode.CharCode.encode')"
          />
          <VListItem
            title="Decode"
            @click="applyFunction('Encode.CharCode.decode')"
          />
        </VList>
      </VMenu>
      <VListItem
        title="Polyglot"
        @click="applyFunction('Payload.XSS.polyglot', true)"
      />
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { mdiChevronRight, mdiMenuDown } from '@mdi/js'
import { defineComponent, inject } from 'vue'
import { ApplyFunctionKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuXss',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!

    return {
      mdiChevronRight,
      mdiMenuDown,

      applyFunction,
    }
  },
})
</script>
