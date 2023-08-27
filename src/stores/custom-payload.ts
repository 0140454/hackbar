import { defineStore } from 'pinia'
import { ref } from 'vue'
import browser from 'webextension-polyfill'

export default defineStore('custom-payload', () => {
  const data = ref<Array<CustomPayload>>([])

  const loadStorage = async () => {
    const { customPayload } = await browser.storage.local.get({
      customPayload: '[]',
    })

    data.value = JSON.parse(customPayload) as Array<CustomPayload>
  }

  const updateStorage = async () => {
    await browser.storage.local.set({
      customPayload: JSON.stringify(data.value),
    })
  }

  const save = async (index: number, payload: CustomPayload) => {
    if (index < 0) {
      data.value.push(payload)
    } else {
      data.value[index] = payload
    }

    await updateStorage()
  }
  const remove = async (index: number) => {
    data.value.splice(index, 1)

    await updateStorage()
  }

  return {
    data,
    init: loadStorage,
    save,
    remove,
  }
})
