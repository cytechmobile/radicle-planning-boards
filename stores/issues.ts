import { issuePriorityIncrement } from '~/constants/issues'
import type { Issue } from '~/types/httpd'
import { getIssuePriority } from '~/utils/issues'

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
        issuesByColumn: orderIssuesByColumn(groupIssuesByColumn(data as Issue[])),
      }),
    },
  )

  const issuesByColumn = computed(() => issuesData.value?.issuesByColumn)

  // Merge issue-derived columns with existing columns
  watchEffect(() => {
    if (issuesByColumn.value) {
      board.mergeColumns(Object.keys(issuesByColumn.value))
    }
  })

  // Initialize issues order
  watchEffect(() => {
    // TODO: Revisit
    async function initializeIssuesOrder() {
      if (!issuesByColumn.value) {
        return
      }

      const partialPriorityDataLabel = createPartialDataLabel('priority')

      for (const issues of Object.values(issuesByColumn.value)) {
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

  async function moveIssue({
    issue,
    column,
    index,
  }: {
    issue: Issue
    column: string
    index: number
  }) {
    if (!issuesByColumn.value) {
      return
    }

    const columnIssues = issuesByColumn.value[column]
    if (!issue || !columnIssues) {
      return
    }

    const priority = calculateUpdatedIssuePriority({
      issues: columnIssues,
      id: issue.id,
      index,
    })

    const labels = createUpdatedIssueLabels(issue, {
      column,
      priority,
    })

    await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
      path: { rid: route.params.rid, issue: issue.id },
      method: 'PATCH',
      body: {
        type: 'label',
        labels,
      },
    })

    await refreshIssues()
  }

  async function createIssue({ title, column }: { title: string; column: string }) {
    const columnIssues = issuesByColumn.value?.[column]
    if (columnIssues === undefined) {
      return
    }

    const labels: string[] = []

    if (column !== 'non-planned') {
      labels.push(createDataLabel('column', column))
    }

    const lastIssue = columnIssues.at(-1)
    const priority = lastIssue
      ? (getIssuePriority(lastIssue) ?? 0) + issuePriorityIncrement
      : issuePriorityIncrement
    labels.push(createDataLabel('priority', priority))

    await $httpdFetch('/projects/{rid}/issues', {
      method: 'POST',
      path: {
        rid: route.params.rid,
      },
      body: {
        title,
        description: '',
        labels,
        assignees: [],
        // @ts-expect-error - wrong type definition
        embeds: [],
      },
    })

    await refreshIssues()
  }

  // TODO: remove
  async function deletePriorityLabels() {
    if (!issuesByColumn.value) {
      return
    }

    for (const columnIssues of Object.values(issuesByColumn.value)) {
      for (const issue of columnIssues) {
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
    }

    await refreshIssues()
  }

  const store = {
    issuesByColumn,
    moveIssue,
    createIssue,
    deletePriorityLabels,
  }

  return store
})
