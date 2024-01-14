/* eslint-disable prettier/prettier */
import { issuePriorityIncrement } from '~/constants/issues'
import type { Issue } from '~/types/httpd'

export const useIssuesStore = defineStore('issues', () => {
  const { $httpdFetch } = useNuxtApp()
  const route = useRoute()

  const board = useBoardStore()

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

  // TODO: Check if this can be done in the transform function
  const orderedIssuesByColumn = computed(() =>
    (issuesData.value?.issuesByColumn
      ? orderIssuesByColumn(issuesData.value.issuesByColumn)
      : null),
  )

  // Merge issue-derived columns with existing columns
  watchEffect(() => {
    if (issuesData.value?.issuesByColumn) {
      board.mergeColumns(Object.keys(issuesData.value.issuesByColumn))
    }
  })

  // Initialize issues order
  watchEffect(() => {
    // TODO: Revisit
    async function initializeIssuesOrder() {
      if (!issuesData.value?.issuesByColumn) {
        return
      }

      const partialPriorityDataLabel = createPartialDataLabel('priority')

      for (const issues of Object.values(issuesData.value.issuesByColumn)) {
        for (const [index, issue] of issues.entries()) {
          if (issue.labels.some((label) => label.startsWith(partialPriorityDataLabel))) {
            return
          }

          // If the issue doesn't have a priority label, add it
          const newLabels = [...issue.labels]

          if (!newLabels.some((label) => label.startsWith(partialPriorityDataLabel))) {
            newLabels.push(createDataLabel('priority', (index + 1) * issuePriorityIncrement))
          }

          await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
            path: { rid: route.params.rid, issue: issue.id },
            method: 'PATCH',
            body: {
              type: 'label',
              labels: newLabels,
            },
          })
        }
      }
      await refreshIssues()
    }

    initializeIssuesOrder()
  })

  async function handleMoveIssue({
    id,
    column,
    newIndex,
  }: {
    id: string
    column: string
    newIndex: number
  }) {
    if (!issuesData.value) {
      return
    }

    const columnIssues = issuesData.value.issuesByColumn[column]
    const issue = issuesData.value.issues.find((issue) => issue.id === id)
    if (!issue || !columnIssues) {
      return
    }

    const priority = calculateUpdatedIssuePriority({
      issues: columnIssues,
      id,
      newIndex,
    })

    const labels = createUpdatedIssueLabels(issue, {
      column,
      priority,
    })

    await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
      path: { rid: route.params.rid, issue: id },
      method: 'PATCH',
      body: {
        type: 'label',
        labels,
      },
    })

    await refreshIssues()
  }

  async function handleCreateIssue({ title, column }: { title: string; column: string }) {
    // TODO: Add issue priority to be the last one

    await $httpdFetch('/projects/{rid}/issues', {
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
  }

  // TODO: remove
  async function deletePriorityLabels() {
    if (!issuesData.value?.issues) {
      return
    }

    for (const issue of issuesData.value.issues) {
      const newLabels = issue.labels.filter(
        (label) => !label.startsWith(createPartialDataLabel('priority')),
      )

      if (newLabels.length === issue.labels.length) {
        continue
      }

      await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
        path: { rid: route.params.rid, issue: issue.id },
        method: 'PATCH',
        body: {
          type: 'label',
          labels: newLabels,
        },
      })
    }
    await refreshIssues()
  }

  const store = {
    issuesByColumn: orderedIssuesByColumn,
    handleMoveIssue,
    handleCreateIssue,
    deletePriorityLabels,
  }

  return store
})
