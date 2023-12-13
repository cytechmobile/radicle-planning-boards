<script setup lang="ts">
import { type Issue, type IssueStatus, mockIssues } from '../constants/issues'

function filterIssuesWithLabel(issues: Issue[], label: IssueStatus): Issue[] {
  const issuesWithLabel = issues.filter((issue) => issue.labels.includes(label))

  return issuesWithLabel
}

const uniqueLabels = [...new Set(mockIssues.flatMap((issue) => issue.labels))]

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="label in uniqueLabels"
      :key="label"
      :title="label"
      :issues="filterIssuesWithLabel(mockIssues, label)"
    />
  </div>
</template>
