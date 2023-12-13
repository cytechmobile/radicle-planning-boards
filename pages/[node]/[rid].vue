<script setup lang="ts">
import { COLUMN_TITLES } from '~/constants/columns'

const issuesByColumn = useIssuesByColumn()

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="columnTitle in COLUMN_TITLES"
      :key="columnTitle"
      :title="columnTitle"
      :issues="issuesByColumn[columnTitle].value"
    />
  </div>
</template>
