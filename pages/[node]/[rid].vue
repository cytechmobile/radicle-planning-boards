<script setup lang="ts">
import type { Issue } from '~/types/httpd'
import { initialColumns } from '~/constants/columns'

const { $httpdFetch } = useNuxtApp()
const route = useRoute()

const issuesOrder = ref<Record<string, string[]> | null>(null)

const { data: issuesData, refresh: refreshIssues } = useAsyncData(
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

const orderedIssuesByColumn = computed(() => {
  if (!issuesData.value || !issuesOrder.value) {
    return null
  }

  return orderIssuesByColumn(issuesData.value.issuesByColumn, issuesOrder.value)
})

watchEffect(() => {
  function initializeIssuesOrder() {
    if (!issuesData.value?.issuesByColumn || issuesOrder.value) {
      return
    }

    issuesOrder.value = Object.fromEntries(
      Object.entries(issuesData.value.issuesByColumn).map(([column, issues]) => [
        column,
        issues.map((issue) => issue.id),
      ]),
    )
  }

  initializeIssuesOrder()
})

function updateIssueOrder({
  id,
  from,
  to,
  oldIndex,
  newIndex,
}: {
  id: string
  from: string
  to: string
  oldIndex: number
  newIndex: number
}) {
  if (!issuesData.value || !issuesOrder.value) {
    return
  }

  initializeArrayForKey(issuesOrder.value, from).splice(oldIndex, 1)
  initializeArrayForKey(issuesOrder.value, to).splice(newIndex, 0, id)
}

async function handleUpdateIssueColumn({
  id,
  from,
  to,
  oldIndex,
  newIndex,
}: {
  id: string
  from: string
  to: string
  oldIndex: number
  newIndex: number
}) {
  if (!issuesData.value || !issuesOrder.value) {
    return
  }

  const issue = issuesData.value.issues.find((issue) => issue.id === id)
  if (!issue) {
    return
  }

  const labels = createUpdatedIssueLabels(issue, to)

  await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
    path: { rid: route.params.rid, issue: id },
    method: 'PATCH',
    body: {
      type: 'label',
      labels,
    },
  })

  await refreshIssues()

  updateIssueOrder({ id, from, to, oldIndex, newIndex })
}

function handleUpdateIssue({
  id,
  from,
  oldIndex,
  newIndex,
}: {
  id: string
  from: string
  oldIndex: number
  newIndex: number
}) {
  updateIssueOrder({ id, from, to: from, oldIndex, newIndex })
}

async function handleCreateIssue({ title, column }: { title: string; column: string }) {
  const { id } = await $httpdFetch('/projects/{rid}/issues', {
    method: 'POST',
    path: {
      rid: route.params.rid,
    },
    body: {
      title,
      description: '',
      labels: column !== 'non-planned' ? [createDataLabel('column', column)] : [],
      assignees: [],
      // @ts-expect-error - wrong type definition
      embeds: [],
    },
  })

  await refreshIssues()

  if (issuesOrder.value && id) {
    initializeArrayForKey(issuesOrder.value, column).push(id)
  }
}

const columns = computed(() =>
  orderedIssuesByColumn.value ? Object.keys(orderedIssuesByColumn.value) : initialColumns,
)

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="column in columns"
      :key="column"
      :title="column"
      :issues="orderedIssuesByColumn?.[column] ?? []"
      @create="(title) => handleCreateIssue({ title, column })"
      @add="handleUpdateIssueColumn"
      @update="handleUpdateIssue"
    />
  </div>
</template>
