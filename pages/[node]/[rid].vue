<script setup lang="ts">
import { ISSUE_STATUSES } from '~/constants/issues'
import type { Issue, IssueStatus } from '~/types/issues'

const route = useRoute('node-rid')

async function fetchIssues(): Promise<Issue[]> {
  const res = await fetch(
    `https://${route.params.node}/api/v1/projects/${route.params.rid}/issues`,
  )

  return (await res.json()) as Issue[]
}

function initializeIssuesStatuses(issues: Issue[]): Issue[] {
  return issues.map((issue) => {
    const hasStatus = issue.labels.some((label) => {
      const statusDataLabels = ISSUE_STATUSES.map((status) =>
        createDataLabel('status', status),
      )

      return statusDataLabels.includes(label)
    })

    if (!hasStatus) {
      issue.labels.push(createDataLabel('status', 'todo'))
    }

    return issue
  })
}

function filterIssuesByStatus(issues: Issue[], status: IssueStatus): Issue[] {
  const issuesWithStatus = issues.filter((issue) =>
    issue.labels.includes(createDataLabel('status', status)),
  )

  return issuesWithStatus
}

const issues = ref<Issue[]>([])

onMounted(async () => {
  const fetchedIssues = await fetchIssues()

  issues.value = initializeIssuesStatuses(fetchedIssues)
})

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="status in ISSUE_STATUSES"
      :key="status"
      :title="status"
      :issues="filterIssuesByStatus(issues, status)"
    />
  </div>
</template>
