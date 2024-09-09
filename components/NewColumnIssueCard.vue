<script setup lang="ts">
const emit = defineEmits<{
  submit: [title: string]
  close: []
}>()

const formRef = ref<HTMLFormElement>()
const titleInputRef = ref<HTMLInputElement>()
const title = ref('')

onClickOutside(formRef, () => {
  emit('close')
})
useFocus(titleInputRef, { initialValue: true })

function handleSubmit() {
  emit('submit', title.value.trim())
  emit('close')
}
</script>

<template>
  <form
    ref="formRef"
    class="flex flex-col gap-2 rounded bg-rad-background-float p-3"
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
          placeholder="Enter issue title..."
          class="w-full rounded border border-rad-border-hint bg-rad-background-dip px-2 py-1 text-sm text-rad-foreground-contrast focus:border-rad-border-focus focus:outline-none"
        />
      </label>

      <IconButton label="Cancel" icon="bx:x" @click="$emit('close')" />
    </div>

    <button
      class="h-6 w-fit self-end rounded bg-rad-fill-secondary px-2 text-sm font-semibold text-rad-foreground-match-background disabled:bg-rad-fill-ghost disabled:text-rad-foreground-disabled"
      type="submit"
      :disabled="title.length === 0"
    >
      Submit
    </button>
  </form>
</template>