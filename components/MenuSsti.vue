<template>
  <VMenu offset-y>
    <template #activator="{ on }">
      <VBtn text v-on="on">
        SSTI
        <VIcon small right>mdi-menu-down</VIcon>
      </VBtn>
    </template>
    <VList dense>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>Jinja2 (Python)</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-chevron-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="
              applyFunction('Payload.SSTI.Jinja2.tuple2AllSubclasses', true)
            "
          >
            <VListItemTitle>Show subclasses with tuple</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.tuple2RCE', true)"
          >
            <VListItemTitle>From Tuple to RCE</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Payload.SSTI.Jinja2.g2RCE', true)">
            <VListItemTitle>From Flask g to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.urlFor2RCE', true)"
          >
            <VListItemTitle>From Flask url_for to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.application2RCE', true)"
          >
            <VListItemTitle>From Flask application to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.config2RCE', true)"
          >
            <VListItemTitle>From Flask config to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="
              applyFunction('Payload.SSTI.Jinja2.getFlashedMessages2RCE', true)
            "
          >
            <VListItemTitle>
              From Flask get_flashed_messages to RCE
            </VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.self2RCE', true)"
          >
            <VListItemTitle>From self to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.lipsum2RCE', true)"
          >
            <VListItemTitle>From lipsum to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.cycler2RCE', true)"
          >
            <VListItemTitle>From cycler to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.joiner2RCE', true)"
          >
            <VListItemTitle>From joiner to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.namespace2RCE', true)"
          >
            <VListItemTitle>From namespace to RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Jinja2.addUrlRule', true)"
          >
            <VListItemTitle> Add a new endpoint for RCE result </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>Java</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-chevron-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="applyFunction('Payload.SSTI.Java.commonRCE', true)"
          >
            <VListItemTitle>Common Java Template RCE</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SSTI.Java.thymeleafRCE', true)"
          >
            <VListItemTitle>Thymeleaf RCE</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
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
  name: 'MenuSsti',
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
