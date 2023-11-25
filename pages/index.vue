<script setup lang="ts">
import { type Issue, type IssueStatus, mockIssues } from '../constants/issues'

function filterIssuesWithStatus(issues: Issue[], status: IssueStatus): Issue[] {
  const foundIssues = issues.filter((issue) => issue.state.status === status)

  return foundIssues
}

const statuses = [...new Set(mockIssues.map((issue) => issue.state.status))]
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto px-2 py-6">
    <Column
      v-for="status in statuses"
      :key="status"
      :title="status"
      :issues="filterIssuesWithStatus(mockIssues, status)"
    />
  </div>
</template>
