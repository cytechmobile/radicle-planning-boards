<script setup lang="ts">
import { elementIds } from '~/constants/elements'

defineOptions({ inheritAttrs: false })

const { queryParams } = useQueryParamsStore()

const inputRef = ref<HTMLInputElement>()
const { focused } = useFocus(inputRef)
// TODO: zac disable this while a modal is open
useEventListener('keydown', (event) => {
  const ctrlF = (event.ctrlKey || event.metaKey) && event.code === 'KeyF'
  if (!ctrlF) {
    return
  }

  event.preventDefault()
  inputRef.value?.focus()
})

// TODO: zac disable this while a modal is open
onKeyStroke('Escape', (event) => {
  if (!focused) {
    return
  }

  event.preventDefault()
  inputRef.value?.blur()
})

const board = useBoardStore()
const label = computed(() => {
  switch (board.state.filter.taskKind) {
    case 'issue':
      return 'Filter issues'
    case 'patch':
      return 'Filter patches'
    default:
      return 'Filter'
  }
})

// Prevents blur when clicking outside the input element
function handleMouseDown(event: MouseEvent) {
  if (event.target !== inputRef.value) {
    event.preventDefault()
  }
}

// TODO: zac pull this out into a generic utility file if reused
function isMac() {
  // TODO: zac look into non-deprecated alternative
  return navigator.platform.toLowerCase().includes('mac')
}
const filterShortcut = `${isMac() ? 'Cmd' : 'Ctrl'}+F`
</script>

<template>
  <form
    :id="elementIds.taskFilterForm"
    role="search"
    class="flex w-96 cursor-text items-center gap-2 rounded-sm border border-rad-border-hint bg-rad-background-dip px-2 text-sm focus-within:ring-2 focus-within:ring-rad-fill-secondary hover:border-rad-border-default"
    @click="inputRef?.focus()"
    @mousedown="handleMouseDown"
    @submit.prevent
  >
    <Icon name="octicon:filter-16" class="text-rad-foreground-dim" size="16" />
    <input
      v-bind="$attrs"
      ref="inputRef"
      v-model="queryParams.filter"
      type="text"
      class="h-full flex-1 bg-inherit outline-none"
      :aria-label="label"
      :placeholder="`${label}…`"
    />
    <UTooltip v-show="Boolean(queryParams.filter)" text="Clear">
      <IconButton
        label="Clear"
        icon="octicon:x-16"
        :padded="false"
        @click="queryParams.filter = ''"
      />
    </UTooltip>
    <!-- TODO: zac hide on mobile devices -->
    <UTooltip v-show="!focused" :text="`Press ${filterShortcut} to focus`">
      <kbd
        class="flex h-5 min-w-5 select-none items-center justify-center rounded-sm border border-rad-border-default px-1 font-sans text-xs font-medium"
      >
        {{ filterShortcut }}
      </kbd>
    </UTooltip>
  </form>
</template>