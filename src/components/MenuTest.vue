<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn append-icon="mdi-menu-down" variant="text" v-bind="props">
        Test
      </VBtn>
    </template>
    <VList>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            append-icon="mdi-chevron-right"
            title="Common paths"
            v-bind="props"
            @click.stop=""
          />
        </template>
        <VList>
          <VListItem
            title="From web root directory"
            @click="testCommonPathsFromRoot"
          />
          <VListItem
            title="From current directory"
            @click="testCommonPathsFromCurrent"
          />
        </VList>
      </VMenu>
    </VList>
  </VMenu>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'MenuLfi',
  setup() {
    const controlTest = inject<any>('controlTest')

    const testCommonPathsFromRoot = () => {
      controlTest('start', 'test/paths.js', {
        payloadsPath: chrome.runtime.getURL('payloads/paths.txt'),
        fromWebRoot: true,
      })
    }

    const testCommonPathsFromCurrent = () => {
      controlTest('start', 'test/paths.js', {
        payloadsPath: chrome.runtime.getURL('payloads/paths.txt'),
        fromWebRoot: false,
      })
    }

    return {
      testCommonPathsFromRoot,
      testCommonPathsFromCurrent,
    }
  },
})
</script>
