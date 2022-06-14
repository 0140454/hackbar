<template>
  <VMenu offset-y>
    <template #activator="{ on }">
      <VBtn text v-on="on">
        Shell
        <VIcon small right>mdi-menu-down</VIcon>
      </VBtn>
    </template>
    <VList dense>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>Python Reverse Shell</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem @click="applyFunction('Payload.Shell.Python.py3', true)">
            <VListItemTitle>python3</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Payload.Shell.Python.py', true)">
            <VListItemTitle>python</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>sh(bash) Reverse Shell</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem @click="applyFunction('Payload.Shell.sh.withI', true)">
            <VListItemTitle>sh with -i</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Payload.Shell.sh.withoutI', true)">
            <VListItemTitle>sh without -i</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>nc(ncat) Reverse Shell</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem @click="applyFunction('Payload.Shell.nc.withE', true)">
            <VListItemTitle>nc with -e</VListItemTitle>
          </VListItem>
          <VListItem @click="applyFunction('Payload.Shell.nc.withC', true)">
            <VListItemTitle>nc with -c</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VMenu offset-x open-on-hover>
        <template #activator="{ on }">
          <VListItem v-on="on" @click.stop>
            <VListItemTitle>PHP Webshell/Reverse Shell</VListItemTitle>
            <VListItemAction class="justify-end">
              <VIcon small>mdi-menu-right</VIcon>
            </VListItemAction>
          </VListItem>
        </template>
        <VList dense>
          <VListItem
            @click="applyFunction('Payload.Shell.php.reverseShell', true)"
          >
            <VListItemTitle>Reverse Shell</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.Shell.php.webshellEval', true)"
          >
            <VListItemTitle>with eval</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.Shell.php.webshellExec', true)"
          >
            <VListItemTitle>with exec</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.Shell.php.webshellSystem', true)"
          >
            <VListItemTitle>with system</VListItemTitle>
          </VListItem>
          <VListItem
            @click="applyFunction('Payload.Shell.php.webshellBackquote', true)"
          >
            <VListItemTitle>with `</VListItemTitle>
          </VListItem>
          <VListItem
            @click="
              applyFunction('Payload.Shell.php.webshellAllFunction', true)
            "
          >
            <VListItemTitle>
              with any function you want (except eval)
            </VListItemTitle>
          </VListItem>
          <VListItem
            @click="
              applyFunction('Payload.Shell.php.webshellNoAlphabetsDigits', true)
            "
          >
            <VListItemTitle>
              with system && without alphabets and digits (urlencode already)
            </VListItemTitle>
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
  name: 'MenuShell',
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
