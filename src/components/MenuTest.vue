<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn :append-icon="mdiMenuDown" variant="text" v-bind="props">
        Test
      </VBtn>
    </template>
    <VList>
      <VMenu location="end" open-on-hover>
        <template #activator="{ props }">
          <VListItem
            :append-icon="mdiChevronRight"
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
import { mdiChevronRight, mdiMenuDown } from '@mdi/js'
import { defineComponent, inject } from 'vue'
import browser from 'webextension-polyfill'
import { ControlTestKey } from '../utils/constants'

export default defineComponent({
  name: 'MenuLfi',
  setup() {
    const controlTest = inject(ControlTestKey)!

    const testCommonPathsFromRoot = () => {
      controlTest('start', 'test/paths.js', {
        payloadsPath: browser.runtime.getURL('payloads/paths.txt'),
        fromWebRoot: true,
      })
    }

    const testCommonPathsFromCurrent = () => {
      controlTest('start', 'test/paths.js', {
        payloadsPath: browser.runtime.getURL('payloads/paths.txt'),
        fromWebRoot: false,
      })
    }

    return {
      mdiChevronRight,
      mdiMenuDown,

      testCommonPathsFromRoot,
      testCommonPathsFromCurrent,
    }
  },
})
</script>
