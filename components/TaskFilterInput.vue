<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const { queryParams } = useQueryParamsStore()

const inputRef = ref<HTMLInputElement>()
const { focused } = useFocus(inputRef)
// TODO: zac disable this while a modal is open
onKeyStroke('/', (event) => {
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
</script>

<template>
  <form
    role="search"
    class="flex w-96 cursor-text items-center gap-2 rounded-sm border border-rad-border-hint bg-rad-background-dip px-2 focus-within:outline focus-within:outline-rad-fill-secondary hover:border-rad-border-default"
    @mousedown.prevent
    @click="inputRef?.focus()"
  >
    <Icon name="octicon:filter-16" class="text-rad-foreground-dim" />
    <input
      v-bind="$attrs"
      ref="inputRef"
      v-model="queryParams.query"
      type="text"
      class="h-full flex-1 bg-inherit outline-none"
      :aria-label="label"
      :placeholder="label"
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