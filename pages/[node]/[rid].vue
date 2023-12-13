<script setup lang="ts">
import { ISSUE_STATUSES } from '~/constants/issues'
import type { Issue, IssueStatus } from '~/types/issues'

const route = useRoute('node-rid')

const response = useHttpdFetch('/projects/{rid}/issues', {
  path: {
    rid: route.params.rid,
  },
})

const issues = response.data as Ref<Issue[] | undefined>

function filterIssuesByStatus(issues: Issue[], status: IssueStatus): Issue[] {
  const issuesWithStatus = issues.filter((issue) =>
    issue.labels.includes(createDataLabel('status', status)),
  )

  return issuesWithStatus
}

const issuesWithoutStatus = computed(() =>
  (issues.value ?? []).filter(
    (issue) =>
      !issue.labels.some((label) => label.startsWith(createPartialDataLabel('status'))),
  ),
)

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column title="not-planned" :issues="issuesWithoutStatus" />
    <Column
      v-for="status in ISSUE_STATUSES"
      :key="status"
      :title="status"
      :issues="filterIssuesByStatus(issues ?? [], status)"
    />
  </div>
</template>
