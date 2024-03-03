import { taskPriorityIncrement } from '~/constants/tasks'
import type { RadicleIssue, RadiclePatch } from '~/types/httpd'
import type { Task } from '~/types/tasks'

export const useTasksStore = defineStore('tasks', () => {
  const { $httpdFetch } = useNuxtApp()
  const route = useRoute()

  const board = useBoardStore()

  const isMovingTask = ref(false)
  const isCreatingTask = ref(false)
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

      const [openRadicleIssues, closedRadicleIssues] = await Promise.all([
        $httpdFetch('/projects/{rid}/issues', createFetchIssuesOptions('open')),
        $httpdFetch('/projects/{rid}/issues', createFetchIssuesOptions('closed')),
      ])

      return [...openRadicleIssues, ...closedRadicleIssues] as RadicleIssue[]
    },
    {
      transform: (radicleIssues) => radicleIssues.map(transformRadicleIssueToIssue),
    },
  )

  const {
    data: patches,
    pending: arePatchesPending,
    refresh: refreshPatches,
  } = useAsyncData(
    'patches',
    async () => {
      const radiclePatches = await $httpdFetch('/projects/{rid}/patches', {
        path: {
          rid: route.params.rid,
        },
      })

      return radiclePatches as RadiclePatch[]
    },
    {
      transform: (radiclePatches) => radiclePatches.map(transformRadiclePatchToPatch),
    },
  )

  const isLoading = computed(
    () =>
      areIssuesPending.value ||
      arePatchesPending.value ||
      isMovingTask.value ||
      isCreatingTask.value,
  )

  const tasksByColumn = computed(() => {
    if (issues.value === null || patches.value === null) {
      return null
    }

    const tasks = orderTasksByColumn(
      groupTasksByColumn({
        tasks: [...issues.value, ...patches.value],
        columns: board.columns,
      }),
    )

    return tasks
  })

  async function initializePriority() {
    if (!tasksByColumn.value) {
      return
    }

    for (const tasks of Object.values(tasksByColumn.value)) {
      const tasksWithoutPriority: Task[] = []
      let highestPriority = 0

      for (const task of tasks) {
        if (task.rpb.priority === null) {
          tasksWithoutPriority.push(task)
        } else if (task.rpb.priority > highestPriority) {
          highestPriority = task.rpb.priority
        }
      }

      for (const [index, task] of tasksWithoutPriority.entries()) {
        const priority = highestPriority + (index + 1) * taskPriorityIncrement

        // TODO: zac extract this into a function
        switch (task.rpb.kind) {
          case 'issue':
            await $httpdFetch(`/projects/{rid}/issues/{issue}`, {
              path: { rid: route.params.rid, issue: task.id },
              method: 'PATCH',
              body: {
                type: 'label',
                labels: [...task.labels, createDataLabel('priority', priority)],
              },
            })
            break
          case 'patch':
            await $httpdFetch(`/projects/{rid}/patches/{patch}`, {
              path: { rid: route.params.rid, patch: task.id },
              method: 'PATCH',
              body: {
                type: 'label',
                labels: [...task.labels, createDataLabel('priority', priority)],
              },
            })
            break
        }
      }
    }

    // TODO: zac check which needs to be refreshed and refresh only that one
    await refreshIssues()
    await refreshPatches()
  }

  watch(
    () => [issues.value, patches.value],
    ([newIssues, newPatches], [oldIssues, oldPatches]) => {
      // TODO: check if user has write access
      // Only initialize tasks on first fetch
      if ((newIssues && !oldIssues) || (newPatches && !oldPatches)) {
        initializePriority()
      }
    },
  )

  // Merge task-derived columns with existing columns
  watchEffect(() => {
    if (tasksByColumn.value) {
      board.mergeColumns(Object.keys(tasksByColumn.value))
    }
  })

  async function moveTask({
    task,
    column,
    index,
  }: {
    task: Task
    column: string
    index: number
  }) {
    const columnTasks = tasksByColumn.value?.[column]
    if (!task || !columnTasks) {
      return
    }

    const [currentTaskUpdate, ...otherTaskUpdates] = calculatePriorityUpdates({
      tasks: columnTasks,
      task,
      index,
    })

    if (!currentTaskUpdate) {
      return
    }

    isMovingTask.value = true

    // TODO: extract this into a function
    switch (task.rpb.kind) {
      case 'issue':
        await $httpdFetch('/projects/{rid}/issues/{issue}', {
          path: { rid: route.params.rid, issue: task.id },
          method: 'PATCH',
          body: {
            type: 'label',
            labels: createUpdatedTaskLabels(task, {
              column,
              priority: currentTaskUpdate.priority,
            }),
          },
        })
        break
      case 'patch':
        await $httpdFetch('/projects/{rid}/patches/{patch}', {
          path: { rid: route.params.rid, patch: task.id },
          method: 'PATCH',
          body: {
            type: 'label',
            labels: createUpdatedTaskLabels(task, {
              column,
              priority: currentTaskUpdate.priority,
            }),
          },
        })
        break
    }

    for (const { task, priority } of otherTaskUpdates) {
      // TODO: extract this into a function
      switch (task.rpb.kind) {
        case 'issue':
          await $httpdFetch('/projects/{rid}/issues/{issue}', {
            path: { rid: route.params.rid, issue: task.id },
            method: 'PATCH',
            body: {
              type: 'label',
              labels: createUpdatedTaskLabels(task, { priority }),
            },
          })
          break
        case 'patch':
          await $httpdFetch('/projects/{rid}/patches/{patch}', {
            path: { rid: route.params.rid, patch: task.id },
            method: 'PATCH',
            body: {
              type: 'label',
              labels: createUpdatedTaskLabels(task, { priority }),
            },
          })
          break
      }
    }

    // TODO: check which needs to be refreshed and refresh only that one
    await refreshIssues()
    await refreshPatches()

    isMovingTask.value = false
  }

  async function createIssue({ title, column }: { title: string; column: string }) {
    const columnIssues = tasksByColumn.value?.[column]
    if (columnIssues === undefined) {
      return
    }

    const labels: string[] = []

    if (column !== 'non-planned') {
      labels.push(createDataLabel('column', column))
    }

    const lastIssue = columnIssues.at(-1)
    const priority = lastIssue
      ? (lastIssue.rpb.priority ?? 0) + taskPriorityIncrement
      : taskPriorityIncrement
    labels.push(createDataLabel('priority', priority))

    isCreatingTask.value = true

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

    isCreatingTask.value = false
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
    tasksByColumn,
    isLoading,
    moveTask,
    createIssue,
    isResettingPriority,
    resetPriority,
  }

  return store
})
