<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn append-icon="mdi-menu-down" variant="text" v-bind="props">
        Shell
      </VBtn>
    </template>
    <VList>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            append-icon="mdi-chevron-right"
            title="Python Reverse Shell"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Python3"
            @click="openReverseShellPrompt('Payload.Shell.Python.py3')"
          />
          <VListItem
            title="Python"
            @click="openReverseShellPrompt('Payload.Shell.Python.py')"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            append-icon="mdi-chevron-right"
            title="sh(bash) Reverse Shell"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="sh with -i"
            @click="openReverseShellPrompt('Payload.Shell.sh.withI')"
          />
          <VListItem
            title="sh without -i"
            @click="openReverseShellPrompt('Payload.Shell.sh.withoutI')"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            append-icon="mdi-chevron-right"
            title="nc(ncat) Reverse Shell"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="nc with -e"
            @click="openReverseShellPrompt('Payload.Shell.nc.withE')"
          />
          <VListItem
            title="nc with -c"
            @click="openReverseShellPrompt('Payload.Shell.nc.withC')"
          />
        </VList>
      </VMenu>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            append-icon="mdi-chevron-right"
            title="PHP Webshell/Reverse Shell"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="Reverse Shell"
            @click="openReverseShellPrompt('Payload.Shell.php.reverseShell')"
          />
          <VListItem
            title="with eval"
            @click="applyFunction('Payload.Shell.php.webshellEval', true)"
          />
          <VListItem
            title="with exec"
            @click="applyFunction('Payload.Shell.php.webshellExec', true)"
          />
          <VListItem
            title="with system"
            @click="applyFunction('Payload.Shell.php.webshellSystem', true)"
          />
          <VListItem
            title="with `"
            @click="applyFunction('Payload.Shell.php.webshellBackquote', true)"
          />
          <VListItem
            title="with any function you want (except eval)"
            @click="
              applyFunction('Payload.Shell.php.webshellAllFunction', true)
            "
          />
          <VListItem
            title="with system && without alphabets and digits (urlencode already)"
            @click="
              applyFunction('Payload.Shell.php.webshellNoAlphabetsDigits', true)
            "
          />
        </VList>
      </VMenu>
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
import { ApplyFunctionKey, OpenReverseShellPromptKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuShell',
  setup() {
    const applyFunction = inject(ApplyFunctionKey)!
    const openReverseShellPrompt = inject(OpenReverseShellPromptKey)!

    return {
      applyFunction,
      openReverseShellPrompt,
    }
  },
})
</script>
