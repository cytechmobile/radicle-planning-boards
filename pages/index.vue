<script setup lang="ts">
import { type Issue, type IssueStatus, mockIssues } from '../constants/issues'

function filterIssuesWithLabel(issues: Issue[], label: IssueStatus): Issue[] {
  const issuesWithLabel = issues.filter((issue) => issue.labels.includes(label))

  return issuesWithLabel
}

const uniqueLabels = [...new Set(mockIssues.flatMap((issue) => issue.labels))]

// TODO: delete, only for demo purposes
const { data: projects } = await useHttpdFetch('/projects')
console.log('projects.value =', projects.value) // eslint-disable-line no-console
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto px-2 py-6">
    <Column
      v-for="label in uniqueLabels"
      :key="label"
      :title="label"
      :issues="filterIssuesWithLabel(mockIssues, label)"
    />
  </div>
</template>
