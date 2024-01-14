<script setup lang="ts">
const auth = useAuthStore()
const board = useBoardStore()
const issues = useIssuesStore()

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <UButton class="w-fit" @click="issues.deletePriorityLabels">Delete Priority</UButton>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="column in board.columns"
      :key="column"
      :title="column"
      :issues="issues.issuesByColumn?.[column] ?? []"
      @create="(title) => issues.handleCreateIssue({ title, column })"
      @move="issues.handleMoveIssue"
    />
    <NewColumn v-if="auth.isAuthenticated" />
  </div>
</template>
