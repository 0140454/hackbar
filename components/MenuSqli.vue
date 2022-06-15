<template>
  <VMenu offset-y>
    <template #activator="{ on }">
      <VBtn text v-on="on">
        SQLi
        <VIcon small right>mdi-menu-down</VIcon>
      </VBtn>
    </template>
    <VList dense>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>MySQL</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-chevron-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpDatabases')"
          >
            <VListItemTitle>Dump all database names</VListItemTitle>
          </VListItem>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpTables')"
          >
            <VListItemTitle>Dump tables from database</VListItemTitle>
          </VListItem>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.MySQL.dumpColumns')"
          >
            <VListItemTitle>Dump columns from database</VListItemTitle>
          </VListItem>
          <VListItem
            @click="
              applyFunction('Payload.SQLi.MySQL.dumpCurrentQueries', true)
            "
          >
            <VListItemTitle>Dump current queries payload</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SQLi.MySQL.dumpInOneShot', true)"
          >
            <VListItemTitle>Dump in one shot payload</VListItemTitle>
          </VListItem>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.MySQL.unionSelect', false)"
          >
            <VListItemTitle>Union select statement</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SQLi.MySQL.errorBased', true)"
          >
            <VListItemTitle> Error-based injection statement </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>PostgreSQL</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-chevron-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpDatabases')"
          >
            <VListItemTitle>Dump all database names</VListItemTitle>
          </VListItem>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpTables')"
          >
            <VListItemTitle>Dump tables from database</VListItemTitle>
          </VListItem>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpColumns')"
          >
            <VListItemTitle>Dump columns from database</VListItemTitle>
          </VListItem>
          <VListItem
            @click="
              sqlInjectionPrompt('Payload.SQLi.PostgreSQL.unionSelect', false)
            "
          >
            <VListItemTitle>Union select statement</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.SQLi.PostgreSQL.errorBased', true)"
          >
            <VListItemTitle> Error-based injection statement </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>SQLite</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-chevron-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.SQLite.dumpTables')"
          >
            <VListItemTitle>Dump tables from database</VListItemTitle>
          </VListItem>
          <VListItem
            @click="sqlInjectionPrompt('Payload.SQLi.SQLite.dumpColumns')"
          >
            <VListItemTitle>
              Dump columns from database (also wit h table name)
            </VListItemTitle>
          </VListItem>
          <VListItem
            @click="
              sqlInjectionPrompt('Payload.SQLi.SQLite.unionSelect', false)
            "
          >
            <VListItemTitle>Union select statement</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VListItem @click="applyFunction('Payload.SQLi.polyglot', true)">
        <VListItemTitle>Polyglot</VListItemTitle>
      </VListItem>
      <VListItem @click="applyFunction('Payload.SQLi.spaceToComment')">
        <VListItemTitle>Space to Inline comment</VListItemTitle>
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
  name: 'MenuSqli',
  components: {
    VBtn,
    VIcon,
    VList,
    VListItem,
    VListItemAction,
    VListItemTitle,
    VMenu,
  },
  inject: ['applyFunction', 'sqlInjectionPrompt'],
})
</script>
