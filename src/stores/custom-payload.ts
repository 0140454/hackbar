import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import browser from 'webextension-polyfill'
import { CustomPayloadTopLevel } from '../utils/constants'

export default defineStore('custom-payload', () => {
  const allItems = ref<Array<CustomPayload>>([])
  const hasCustomPayload = computed(() => allItems.value.length > 0)

  watch(
    allItems,
    () => {
      allItems.value.sort((a, b) => {
        if (a.category === CustomPayloadTopLevel) {
          return -999
        } else if (b.category === CustomPayloadTopLevel) {
          return 999
        }
        return a.category.localeCompare(b.category)
      })
    },
    {
      deep: true,
    },
  )

  const organized = computed(() => {
    return allItems.value.reduce(
      (result, item) => {
        result[item.category] = result[item.category] || []
        result[item.category].push(item)

        return result
      },
      {} as Record<string, Array<CustomPayload>>,
    )
  })
  const topLevelItems = computed(() => {
    return organized.value[CustomPayloadTopLevel] ?? []
  })
  const categorizedItems = computed(() => {
    return Object.entries(organized.value).filter(
      ([key]) => key !== CustomPayloadTopLevel,
    )
  })
  const availableCategories = computed(() => {
    return [
      CustomPayloadTopLevel,
      ...categorizedItems.value.map(([key]) => key),
    ]
  })

  const loadStorage = async () => {
    const { customPayload } = await browser.storage.local.get({
      customPayload: '[]',
    })

    const saved = JSON.parse(customPayload) as Array<CustomPayload>
    allItems.value = saved.map(item => {
      return {
        ...item,
        category: item.category ?? CustomPayloadTopLevel,
      }
    })
  }
  const updateStorage = async () => {
    await browser.storage.local.set({
      customPayload: JSON.stringify(allItems.value),
    })
  }

  const save = async (index: number, payload: CustomPayload) => {
    if (index < 0) {
      allItems.value.push(payload)
    } else {
      allItems.value[index] = payload
    }

    await updateStorage()
  }
  const remove = async (index: number) => {
    allItems.value.splice(index, 1)

    await updateStorage()
  }

  return {
    hasCustomPayload,
    allItems,
    topLevelItems,
    categorizedItems,
    availableCategories,

    init: loadStorage,
    save,
    remove,
  }
})
