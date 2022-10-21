<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        SQLi
      </VBtn>
    </template>
    <VList>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="MySQL"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Dump all database names"
            @click="openSqlInjectionPrompt('Payload.SQLi.MySQL.dumpDatabases')"
          />
          <VListItem
            title="Dump tables from database"
            @click="openSqlInjectionPrompt('Payload.SQLi.MySQL.dumpTables')"
          />
          <VListItem
            title="Dump columns from database"
            @click="openSqlInjectionPrompt('Payload.SQLi.MySQL.dumpColumns')"
          />
          <VListItem
            title="Dump current queries payload"
            @click="
              applyFunction('Payload.SQLi.MySQL.dumpCurrentQueries', true)
            "
          />
          <VListItem
            title="Dump in one shot payload"
            @click="applyFunction('Payload.SQLi.MySQL.dumpInOneShot', true)"
          />
          <VListItem
            title="Union select statement"
            @click="
              openSqlInjectionPrompt('Payload.SQLi.MySQL.unionSelect', false)
            "
          />
          <VListItem
            title="Error-based injection statement"
            @click="applyFunction('Payload.SQLi.MySQL.errorBased', true)"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="PostgreSQL"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Dump all database names"
            @click="
              openSqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpDatabases')
            "
          />
          <VListItem
            title="Dump tables from database"
            @click="
              openSqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpTables')
            "
          />
          <VListItem
            title="Dump columns from database"
            @click="
              openSqlInjectionPrompt('Payload.SQLi.PostgreSQL.dumpColumns')
            "
          />
          <VListItem
            title="Union select statement"
            @click="
              openSqlInjectionPrompt(
                'Payload.SQLi.PostgreSQL.unionSelect',
                false,
              )
            "
          />
          <VListItem
            title="Error-based injection statement"
            @click="applyFunction('Payload.SQLi.PostgreSQL.errorBased', true)"
          />
          <VListItem
            title="Command execution statement"
            @click="applyFunction('Payload.SQLi.PostgreSQL.cmdExec', true)"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
            title="SQLite"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Dump tables from database"
            @click="openSqlInjectionPrompt('Payload.SQLi.SQLite.dumpTables')"
          />
          <VListItem
            title="Dump columns from database (also with table name)"
            @click="openSqlInjectionPrompt('Payload.SQLi.SQLite.dumpColumns')"
          />
          <VListItem
            title="Union select statement"
            @click="
              openSqlInjectionPrompt('Payload.SQLi.SQLite.unionSelect', false)
            "
          />
        </VList>
      </VMenu>
      <VListItem
        title="Polyglot"
        @click="applyFunction('Payload.SQLi.polyglot', true)"
      />
      <VListItem
        title="Space to Inline comment"
        @click="applyFunction('Payload.SQLi.spaceToComment')"
      />
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { mdiChevronRight, mdiMenuDown } from '@mdi/js'
import { defineComponent, inject } from 'vue'
import { ApplyFunctionKey, OpenSqlInjectionPromptKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuSqli',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!
    const openSqlInjectionPrompt = inject(OpenSqlInjectionPromptKey)!

    return {
      mdiChevronRight,
      mdiMenuDown,

      applyFunction,
      openSqlInjectionPrompt,
    }
  },
})
</script>
