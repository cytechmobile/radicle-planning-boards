<script setup lang="ts">
const auth = useAuthStore()
const issues = useIssuesStore()

const columns = computed(() =>
  issues.issuesByColumn ? Object.keys(issues.issuesByColumn) : null,
)
</script>

<template>
  <div v-if="columns" class="flex flex-1 gap-4 overflow-x-auto px-4 pb-4">
    <Column
      v-for="column in columns"
      :key="column"
      :title="column"
      :issues="issues.issuesByColumn?.[column] ?? []"
    />
    <NewColumn v-if="auth.isAuthenticated" />
  </div>
</template>
