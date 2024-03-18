<script setup lang="ts">
const auth = useAuthStore()
const board = useBoardStore()
const tasks = useTasksStore()
const isDebugging = useIsDebugging()

const { isPending: isExportSuccess, start: showExportSuccess } = useTimeout(800, {
  controls: true,
  immediate: false,
})

const { isPending: isImportSuccess, start: showImportSuccess } = useTimeout(800, {
  controls: true,
  immediate: false,
})

async function handleExport() {
  await navigator.clipboard.writeText(board.exportState())
  showExportSuccess()
}

async function handleImport() {
  let clipboardText = ''

  if ('readText' in navigator.clipboard) {
    clipboardText = await navigator.clipboard.readText()
  } else {
    // Fallback for Firefox
    // eslint-disable-next-line no-alert
    clipboardText = prompt('Paste your board data here') ?? ''
  }

  try {
    board.importState(clipboardText)
    showImportSuccess()
  } catch {
    console.error('Failed to import board data')
  }
}
</script>

<template>
  <header class="flex justify-between gap-4 px-4">
    <TaskKindSelect />

    <div class="flex gap-4">
      <a
        class="flex h-8 items-center justify-center gap-2 rounded-sm border border-rad-border-hint px-3 text-sm font-semibold"
        href="https://app.radicle.xyz/nodes/seed.radicle.garden/rad:z2BdUVZFvHdxRfdtGJQdSH2kyXNM6"
        target="_blank"
      >
        <Icon name="octicon:link-external-16" size="16" />
        About
      </a>

      <template v-if="auth.isAuthenticated">
        <UTooltip text="Copy board state to clipboard">
          <UButton
            :icon="isExportSuccess ? 'i-heroicons-check' : 'i-heroicons-square-2-stack'"
            class="rounded"
            @click="handleExport"
          >
            Export
          </UButton>
        </UTooltip>
        <UTooltip text="Import board state from clipboard">
          <UButton
            :icon="isImportSuccess ? 'i-heroicons-check' : 'i-heroicons-arrow-down-on-square'"
            class="rounded"
            @click="handleImport"
          >
            Import
          </UButton>
        </UTooltip>
        <UTooltip v-if="isDebugging" text="Reset card order. All changes will be lost!">
          <UButton
            :icon="tasks.isResettingPriority ? 'i-heroicons-arrow-path' : undefined"
            :disabled="tasks.isLoading || tasks.isResettingPriority"
            @click="tasks.resetPriority"
          >
            Reset Order
          </UButton>
        </UTooltip>
      </template>
    </div>
  </header>
</template>