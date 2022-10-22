<template>
  <VContainer fluid>
    <VTextarea
      ref="urlInput"
      v-model="request.url"
      auto-grow
      class="pb-3 monospaced"
      hide-details
      label="URL"
      :rows="1"
      variant="underlined"
      @focus="onFocus"
    />
    <VRow>
      <VCol cols="12" md="6">
        <div class="d-flex flex-wrap align-center">
          <VSwitch
            ref="postEnabledSwitch"
            v-model="isBodyEnabled"
            :class="$style.postSwitch"
            :color="themeName === 'dark' ? 'white' : 'black'"
            label="Use POST method"
            hide-details
          />
          <VSelect
            v-show="isBodyEnabled"
            ref="enctypeSelect"
            v-model="request.body.enctype"
            :class="postControlWrapped ? 'pt-3' : ''"
            density="compact"
            :items="supportedEnctype"
            label="enctype"
            variant="underlined"
            hide-details
          />
        </div>
        <VTextarea
          v-show="isBodyEnabled"
          v-model="request.body.content"
          class="monospaced"
          :class="postControlWrapped ? 'pt-3' : 'pt-1'"
          label="Body"
          :rows="1"
          variant="underlined"
          auto-grow
          hide-details
          @focus="onFocus"
        />
      </VCol>
      <VCol cols="12" md="6">
        <div style="padding: 11px 0 1px">
          <VBtn :elevation="2" @click="addHeader"> Modify Header </VBtn>
        </div>
        <div
          v-for="(header, index) in request.headers"
          :key="header._createdAt"
          class="d-flex align-baseline"
          :class="
            index === 0
              ? 'pt-3'
              : request.headers[index - 1].value.length === 0
              ? 'pt-3'
              : 'pt-2'
          "
        >
          <VCheckboxBtn v-model="header.enabled" hide-details />
          <div class="d-flex flex-column flex-fill">
            <div class="d-flex align-end">
              <VCombobox
                v-model="header.name"
                :items="commonRequestHeaders"
                class="monospaced"
                label="Name"
                :menu-props="{ maxHeight: 200 }"
                style="flex: 1 0"
                variant="underlined"
                hide-details
                @focus="onFocus"
              />
              <VTextField
                v-model="header.value"
                class="pl-2 monospaced"
                style="flex: 1 0"
                label="Value"
                variant="underlined"
                hide-details
                @focus="onFocus"
              />
              <VBtn
                :icon="mdiClose"
                size="small"
                variant="text"
                @click="deleteHeader(index)"
              />
            </div>
            <div class="pt-1">
              <VChip
                v-if="!header.value.length"
                :prepend-icon="mdiSync"
                size="small"
                style="user-select: none"
                @click="header.removeIfEmptyValue = !header.removeIfEmptyValue"
              >
                Action:
                {{
                  header.removeIfEmptyValue
                    ? 'Remove header'
                    : 'Send empty value'
                }}
              </VChip>
            </div>
          </div>
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import { mdiClose, mdiSync } from '@mdi/js'
import {
  PropType,
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { VSelect, VSwitch, VTextarea } from 'vuetify/components'
import { useTheme } from 'vuetify/framework'
import bodyProcessors from '../processors'
import { BodyAvailableMethods, CommonRequestHeaders } from '../utils/constants'

export default defineComponent({
  name: 'RequestPanelBasic',
  props: {
    modelValue: {
      type: Object as PropType<BrowseRequest>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'focus'],
  setup(props, { emit }) {
    const request = reactive(props.modelValue)
    watch(
      request,
      value => {
        emit('update:modelValue', value)
      },
      { deep: true },
    )

    const theme = useTheme()

    /* Constants */
    const supportedEnctype = bodyProcessors.getNames()

    /* DOM element and refs */
    const urlInput = ref<InstanceType<typeof VTextarea>>()
    const postEnabledSwitch = ref<InstanceType<typeof VSwitch>>()
    const enctypeSelect = ref<InstanceType<typeof VSelect>>()

    /* Computed */
    const isBodyEnabled = computed({
      get: () => {
        return BodyAvailableMethods.includes(request.method)
      },
      set: value => {
        request.method = value ? 'POST' : 'GET'
      },
    })

    /* Headers */
    const addHeader = () => {
      request.headers.unshift({
        enabled: true,
        name: '',
        value: '',
        removeIfEmptyValue: true,
        _createdAt: Date.now(),
      })
    }

    const deleteHeader = (index: number) => {
      request.headers.splice(index, 1)
    }

    /* RWD */
    const postControlWrapped = ref(false)
    const enctypeResizeObserver = new ResizeObserver(() => {
      const selectRect: DOMRect =
        enctypeSelect.value!.$el.getBoundingClientRect()
      const switchRect: DOMRect =
        postEnabledSwitch.value!.$el.getBoundingClientRect()

      const selectCenter = selectRect.top + selectRect.height / 2
      const switchCenter = switchRect.top + switchRect.height / 2

      postControlWrapped.value = selectCenter != switchCenter
    })

    onMounted(() => {
      enctypeResizeObserver.observe(enctypeSelect.value!.$el)
    })
    onBeforeUnmount(() => {
      enctypeResizeObserver.unobserve(enctypeSelect.value!.$el)
    })

    /* Events */
    const onFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    return {
      mdiClose,
      mdiSync,

      supportedEnctype,
      commonRequestHeaders: CommonRequestHeaders,

      urlInput,
      postEnabledSwitch,
      enctypeSelect,

      request,
      isBodyEnabled,

      themeName: theme.global.name,
      postControlWrapped,

      addHeader,
      deleteHeader,

      onFocus,
    }
  },
})
</script>

<style lang="scss" module>
.postSwitch :global .v-selection-control .v-label {
  width: unset;
}
</style>
