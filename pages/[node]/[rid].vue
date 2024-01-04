<script setup lang="ts">
import {
  type Column,
  type Column as ColumnType,
  columnSchema,
  columns,
} from '~/constants/columns'
import type { Issue } from '~/types/httpd'
const { $httpdFetch } = useNuxtApp()

const route = useRoute()

const issuesOrder = ref<Record<ColumnType, string[]> | null>(null)

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
  if (!issuesData.value?.issuesByColumn || issuesOrder.value) {
    return
  }

  const updatedIssuesOrder: Record<Column, string[]> = {
    'non-planned': [],
    'todo': [],
    'doing': [],
    'done': [],
  }

  for (const column of columns) {
    const columnIssues = issuesData.value?.issuesByColumn[column]
    if (!columnIssues) {
      continue
    }

    updatedIssuesOrder[column] = columnIssues.map((issue) => issue.id)
  }

  issuesOrder.value = updatedIssuesOrder
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

  try {
    const fromColumn = columnSchema.parse(from)
    const toColumn = columnSchema.parse(to)

    issuesOrder.value[fromColumn].splice(oldIndex, 1)
    issuesOrder.value[toColumn].splice(newIndex, 0, id)
  } catch {}
}

async function updateIssueColumn({
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

const isInIFrame = globalThis.window !== globalThis.window.parent
</script>

<template>
  <div class="flex flex-1 gap-4 overflow-x-auto" :class="{ 'px-2 py-6': !isInIFrame }">
    <Column
      v-for="column in columns"
      :key="column"
      :title="column"
      :issues="orderedIssuesByColumn ? orderedIssuesByColumn[column] : []"
      @add="updateIssueColumn"
      @update="handleUpdateIssue"
    />
  </div>
</template>
