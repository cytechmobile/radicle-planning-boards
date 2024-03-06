import { taskPriorityIncrement } from '~/constants/tasks'
import type { Task } from '~/types/tasks'

export const useTasksStore = defineStore('tasks', () => {
  const { $httpdFetch } = useNuxtApp()
  const { fetchIssues, fetchPatches, updateTaskLabels } = useTasksFetch()
  const route = useRoute()

  const permissions = usePermissions()
  const board = useBoardStore()

  const isMovingTask = ref(false)
  const isCreatingTask = ref(false)
  const isResettingPriority = ref(false)

  const {
    data: issues,
    pending: areIssuesPending,
    refresh: refreshIssues,
  } = useAsyncData('issues', fetchIssues, {
    transform: (radicleIssues) => radicleIssues.map(transformRadicleIssueToIssue),
  })

  const {
    data: patches,
    pending: arePatchesPending,
    refresh: refreshPatches,
  } = useAsyncData('patches', fetchPatches, {
    transform: (radiclePatches) => radiclePatches.map(transformRadiclePatchToPatch),
  })

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

    let shouldRefreshIssues = false
    let shouldRefreshPatches = false

    for (const tasks of Object.values(tasksByColumn.value)) {
      const tasksWithoutPriority: Task[] = []
      let highestPriority = 0

      for (const task of tasks) {
        if (task.rpb.priority === null) {
          tasksWithoutPriority.push(task)

          if (task.rpb.kind === 'issue') {
            shouldRefreshIssues = true
          } else if (task.rpb.kind === 'patch') {
            shouldRefreshPatches = true
          }
        } else if (task.rpb.priority > highestPriority) {
          highestPriority = task.rpb.priority
        }
      }

      for (const [index, task] of tasksWithoutPriority.entries()) {
        const priority = highestPriority + (index + 1) * taskPriorityIncrement

        await updateTaskLabels(task, [...task.labels, createDataLabel('priority', priority)])
      }
    }

    await Promise.all([
      shouldRefreshIssues ? refreshIssues() : undefined,
      shouldRefreshPatches ? refreshPatches() : undefined,
    ])
  }

  watch(
    () => [permissions.canEditLabels, issues.value, patches.value],
    ([canEditLabels, newIssues, newPatches], [_, oldIssues, oldPatches]) => {
      // Only initialize task priority on first fetch
      if (canEditLabels && newIssues && newPatches && (!oldIssues || !oldPatches)) {
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

    const priorityUpdates = calculatePriorityUpdates({
      tasks: columnTasks,
      task,
      index,
    })

    if (priorityUpdates.length === 0) {
      return
    }

    isMovingTask.value = true

    let shouldRefreshIssues = false
    let shouldRefreshPatches = false

    for (const [index, { task, priority }] of priorityUpdates.entries()) {
      await updateTaskLabels(
        task,
        // Only update column on the task being moved (index === 0)
        createUpdatedTaskLabels(task, { priority, column: index === 0 ? column : undefined }),
      )

      if (task.rpb.kind === 'issue') {
        shouldRefreshIssues = true
      } else if (task.rpb.kind === 'patch') {
        shouldRefreshPatches = true
      }
    }

    await Promise.all([
      shouldRefreshIssues ? refreshIssues() : undefined,
      shouldRefreshPatches ? refreshPatches() : undefined,
    ])

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
