<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const { queryParams } = useQueryParamsStore()

const inputRef = ref<HTMLInputElement>()
const { focused } = useFocus(inputRef)
// TODO: zac disable this while a modal is open
onKeyStroke('/', (event) => {
  // Allow typing in input elements
  if (/input|textarea|select/i.test((event.target as HTMLElement | null)?.tagName ?? '')) {
    return
  }

  event.preventDefault()
  inputRef.value?.focus()
})

const board = useBoardStore()
const label = computed(() => {
  switch (board.state.filter.taskKind) {
    case 'issue':
      return 'Filter issues'
    case 'patch':
      return 'Filter patches'
    default:
      return 'Filter tasks'
  }
})

// Prevents blur when clicking outside the input element
function handleMouseDown(event: MouseEvent) {
  if (event.target !== inputRef.value) {
    event.preventDefault()
  }
}
</script>

<template>
  <form
    role="search"
    class="flex w-96 cursor-text items-center gap-2 rounded-sm border border-rad-border-hint bg-rad-background-dip px-2 focus-within:outline focus-within:outline-rad-fill-secondary hover:border-rad-border-default"
    @click="inputRef?.focus()"
    @mousedown="handleMouseDown"
  >
    <Icon name="octicon:filter-16" class="text-rad-foreground-dim" />
    <input
      v-bind="$attrs"
      ref="inputRef"
      v-model="queryParams.query"
      type="text"
      class="h-full flex-1 bg-inherit outline-none"
      :aria-label="label"
      :placeholder="`${label}…`"
    />
    <UTooltip v-show="Boolean(queryParams.query)" text="Clear filters">
      <IconButton label="Clear filters" icon="octicon:x-16" @click="queryParams.query = ''" />
    </UTooltip>
    <kbd
      v-show="!focused"
      class="flex h-5 min-w-5 items-center justify-center rounded-sm border border-rad-border-default px-1 font-sans text-xs font-medium"
    >
      /
    </kbd>
  </form>
</template>