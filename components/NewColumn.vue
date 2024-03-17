<script setup lang="ts">
const board = useBoardStore()

const formRef = ref<HTMLFormElement | null>(null)
const titleInputRef = ref<HTMLInputElement | null>(null)
const isCreatingNewColumn = ref(false)
const title = ref('')

watchEffect(() => {
  if (!isCreatingNewColumn.value && title.value !== '') {
    title.value = ''
  }
})

onClickOutside(formRef, () => {
  if (isCreatingNewColumn.value) {
    isCreatingNewColumn.value = false
  }
})

watchEffect(() => {
  if (isCreatingNewColumn.value && formRef.value && titleInputRef.value) {
    titleInputRef.value.focus({ preventScroll: true })
    formRef.value.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
})

function handleSubmit() {
  board.addColumn(title.value.trim())
  isCreatingNewColumn.value = false
}

const columnExists = computed(() => board.state.columns.includes(title.value.trim()))
</script>

<template>
  <form
    v-if="isCreatingNewColumn"
    ref="formRef"
    class="relative flex h-fit min-w-[250px] max-w-[250px] flex-col gap-2 rounded border border-rad-border-hint p-2"
    @submit.prevent="handleSubmit"
  >
    <div class="flex items-center justify-between gap-2">
      <label class="flex-1">
        <span class="sr-only">Title</span>
        <input
          ref="titleInputRef"
          v-model="title"
          type="text"
          name="title"
          class="w-full rounded border border-rad-border-hint bg-rad-background-dip px-2 py-1 text-sm text-rad-foreground-contrast focus:border-rad-border-focus focus:outline-none"
        />
      </label>

      <IconButton label="Cancel" icon="bx:x" @click="isCreatingNewColumn = false" />
    </div>
    <UTooltip
      class="self-end"
      text="A column with this name already exists"
      :prevent="!columnExists"
    >
      <button
        class="h-6 w-fit rounded bg-rad-fill-secondary px-2 text-sm font-semibold text-rad-foreground-match-background disabled:bg-rad-fill-ghost disabled:text-rad-foreground-disabled"
        type="submit"
        :disabled="title.length === 0 || columnExists"
      >
        Submit
      </button>
    </UTooltip>
  </form>
  <UTooltip v-else class="h-fit w-fit" text="New column">
    <button
      type="button"
      class="rounded border border-rad-border-hint p-3 leading-none text-rad-foreground-dim hover:border-rad-border-focus"
      @click="isCreatingNewColumn = true"
    >
      <span class="sr-only">New column</span>
      <Icon name="bx:plus" size="20" />
    </button>
  </UTooltip>
</template>