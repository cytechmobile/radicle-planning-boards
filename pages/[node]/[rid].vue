<script setup lang="ts">
import type { Issue } from '~/types/httpd'
import { columnSchema, columns } from '~/constants/columns'
const { $httpdFetch } = useNuxtApp()

const route = useRoute()

const { data: issueData, refresh: refreshIssues } = useAsyncData(
  'all-issues',
  async () => {
    function createFetchIssuesOptions(state: 'open' | 'closed') {
      return {
        path: {
          rid: route.params.rid,
        },
        query: { perPage: 1000, state },
      }
    }

    const [openIssues, closedIssues] = await Promise.all([
      $httpdFetch('/projects/{rid}/issues', createFetchIssuesOptions('open')),
      $httpdFetch('/projects/{rid}/issues', createFetchIssuesOptions('closed')),
    ])

    return [...openIssues, ...closedIssues]
  },
  {
    transform: (data) => ({
      issues: data as Issue[],
      issuesByColumn: groupIssuesByColumn(data as Issue[]),
    }),
  },
)

async function updateIssueColumn({ id, to }: { id: string; to: string }) {
  if (!issueData.value) {
    return
  }

  const issue = issueData.value.issues.find((issue) => issue.id === id)
  if (!issue) {
    return
  }

  let updatedLabels: string[] = []

  try {
    const toColumn = columnSchema.parse(to)
    updatedLabels = createUpdatedIssueLabels(issue, toColumn)
  } catch {
    return
  }

  await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
    path: { rid: route.params.rid, issue: id },
    method: 'PATCH',
    body: {
      type: 'label',
      labels: updatedLabels,
    },
    onResponse: () => {
      refreshIssues()
    },
  })
}

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="column in columns"
      :key="column"
      :title="column"
      :issues="issueData ? issueData.issuesByColumn[column] : []"
      @add="updateIssueColumn"
    />
  </div>
</template>
