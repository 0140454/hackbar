import { defineStore } from 'pinia'
import { ref } from 'vue'
import browser from 'webextension-polyfill'

export default defineStore('custom-payload', () => {
  const data = ref<Array<CustomPayload>>([])

  browser.storage.local
    .get({
      customPayloads: [],
    })
    .then(({ customPayloads }) => {
      data.value = customPayloads
    })
    .catch(error => {
      console.error(error)
    })

  const save = async (index: number, payload: CustomPayload) => {
    if (index < 0) {
      data.value.push(payload)
    } else {
      data.value[index] = payload
    }

    await browser.storage.local.set({
      customPayloads: data.value,
    })
  }
  const remove = async (index: number) => {
    data.value.splice(index, 1)

    await browser.storage.local.set({
      customPayloads: data.value,
    })
  }

  return {
    data,
    save,
    remove,
  }
})
