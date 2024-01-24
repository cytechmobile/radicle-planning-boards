import { issuePriorityIncrement } from '~/constants/issues'
import type { RadicleIssue } from '~/types/httpd'
import type { Issue } from '~/types/issues'

export const useIssuesStore = defineStore('issues', () => {
  const { $httpdFetch } = useNuxtApp()
  const route = useRoute()

  const board = useBoardStore()

  const isMovingIssue = ref(false)
  const isCreatingIssue = ref(false)
  const isResettingPriority = ref(false)

  const {
    data: issues,
    pending: areIssuesPending,
    refresh: refreshIssues,
  } = useAsyncData(
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
      transform: (issues) => (issues as RadicleIssue[]).map(transformIssue),
    },
  )

  const isLoading = computed(
    () => areIssuesPending.value || isMovingIssue.value || isCreatingIssue.value,
  )

  const issuesByColumn = computed(() => {
    return issues.value
      ? orderIssuesByColumn(
          groupIssuesByColumn({ issues: issues.value, columns: board.columns }),
        )
      : null
  })

  async function initializePriority() {
    if (!issuesByColumn.value) {
      return
    }

    for (const issues of Object.values(issuesByColumn.value)) {
      const issuesWithoutPriority: Issue[] = []
      let highestPriority = 0

      for (const issue of issues) {
        if (issue.rpb.priority === null) {
          issuesWithoutPriority.push(issue)
        } else if (issue.rpb.priority > highestPriority) {
          highestPriority = issue.rpb.priority
        }
      }

      for (const [index, issue] of issuesWithoutPriority.entries()) {
        const priority = highestPriority + (index + 1) * issuePriorityIncrement

        await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
          path: { rid: route.params.rid, issue: issue.id },
          method: 'PATCH',
          body: {
            type: 'label',
            labels: [...issue.labels, createDataLabel('priority', priority)],
          },
        })
      }
    }

    await refreshIssues()
  }

  watch(issues, (newIssues, oldIssues) => {
    // Only initialize issues on first fetch
    if (newIssues && !oldIssues) {
      initializePriority()
    }
  })

  // Merge issue-derived columns with existing columns
  watchEffect(() => {
    if (issuesByColumn.value) {
      board.mergeColumns(Object.keys(issuesByColumn.value))
    }
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
    const columnIssues = issuesByColumn.value?.[column]
    if (!issue || !columnIssues) {
      return
    }

    const [currentIssueUpdate, ...otherIssueUpdates] = calculatePriorityUpdates({
      issues: columnIssues,
      issue,
      index,
    })

    if (!currentIssueUpdate) {
      return
    }

    isMovingIssue.value = true

    await $httpdFetch('/projects/{rid}/issues/{issue}', {
      path: { rid: route.params.rid, issue: issue.id },
      method: 'PATCH',
      body: {
        type: 'label',
        labels: createUpdatedIssueLabels(issue, {
          column,
          priority: currentIssueUpdate.priority,
        }),
      },
    })

    for (const { issue, priority } of otherIssueUpdates) {
      await $httpdFetch('/projects/{rid}/issues/{issue}', {
        path: { rid: route.params.rid, issue: issue.id },
        method: 'PATCH',
        body: {
          type: 'label',
          labels: createUpdatedIssueLabels(issue, { priority }),
        },
      })
    }

    await refreshIssues()

    isMovingIssue.value = false
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
      ? (lastIssue.rpb.priority ?? 0) + issuePriorityIncrement
      : issuePriorityIncrement
    labels.push(createDataLabel('priority', priority))

    isCreatingIssue.value = true

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

    isCreatingIssue.value = false
  }

  async function resetPriority() {
    if (!issues.value) {
      return
    }

    isResettingPriority.value = true

    const partialPriorityLabel = createPartialDataLabel('priority')

    for (const issue of issues.value) {
      const newLabels = issue.labels.filter((label) => !label.startsWith(partialPriorityLabel))

      if (newLabels.length !== issue.labels.length) {
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
    await initializePriority()

    isResettingPriority.value = false
  }

  const store = {
    issuesByColumn,
    isLoading,
    moveIssue,
    createIssue,
    isResettingPriority,
    resetPriority,
  }

  return store
})
