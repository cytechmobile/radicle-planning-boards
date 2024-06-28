import { taskPriorityIncrement } from '~/constants/tasks'
import type { Task, TaskHighlights } from '~/types/tasks'

export const useTasksStore = defineStore('tasks', () => {
  const { $httpd } = useNuxtApp()
  const { tasks, areTasksPending, refreshTasks, refreshSpecificTasks, updateTaskLabels } =
    useTasksFetch()
  const route = useRoute('node-rid')
  const permissions = usePermissions()
  const board = useBoardStore()

  const isReady = ref(false)
  const isCreatingTask = ref(false)
  const isResettingPriority = ref(false)

  const isLoading = computed(() => areTasksPending.value || isCreatingTask.value)

  const { filteredTasks, taskHighlights } = useFilteredTasks()
  const tasksByColumn = computed(() => {
    if (filteredTasks.value === undefined) {
      return undefined
    }

    const orderedTasks = orderTasksByColumn(
      groupTasksByColumn({
        tasks: filteredTasks.value,
        columns: board.state.columns,
      }),
    )

    return orderedTasks
  })

  watchEffect(() => {
    if (!isReady.value && tasks.value) {
      isReady.value = true
    }
  })

  // Initialize task priority after first fetch
  watchEffect(() => {
    if (permissions.canEditLabels && isReady.value) {
      initializePriority()
    }
  })

  // Merge task-derived columns with existing columns
  watchEffect(() => {
    if (tasksByColumn.value) {
      board.mergeColumns(Object.keys(tasksByColumn.value))
    }
  })

  async function initializePriority() {
    if (!tasks.value) {
      return
    }

    const tasksWithoutPriority: Task[] = []
    let highestPriority = 0

    for (const task of tasks.value) {
      if (task.rpb.priority === null) {
        tasksWithoutPriority.push(task)
      } else if (task.rpb.priority > highestPriority) {
        highestPriority = task.rpb.priority
      }
    }

    for (const [index, task] of tasksWithoutPriority.entries()) {
      const priority = highestPriority + (index + 1) * taskPriorityIncrement

      await updateTaskLabels(task, [...task.labels, createDataLabel('priority', priority)])
    }

    if (tasksWithoutPriority.length > 0) {
      await refreshTasks()
    }
  }

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

    await Promise.all(
      priorityUpdates.map(async ({ task, priority }, index) => {
        // Only update column on the task being moved (index === 0)
        const updatedLabels = createUpdatedTaskLabels(task, {
          priority,
          column: index === 0 ? column : undefined,
        })

        task.labels = updatedLabels
        task.rpb.priority = priority
        if (index === 0) {
          task.rpb.column = column
        }

        await updateTaskLabels(task, updatedLabels)
      }),
    )

    await refreshSpecificTasks(priorityUpdates.map(({ task }) => task))
  }

  async function createIssue({ title, column }: { title: string; column: string }) {
    const columnIssues = tasksByColumn.value?.[column]
    if (columnIssues === undefined) {
      return
    }

    const labels: string[] = []

    if (permissions.canEditLabels) {
      if (column !== 'non-planned') {
        labels.push(createDataLabel('column', column))
      }

      const lastIssue = columnIssues.at(-1)
      const priority = lastIssue
        ? (lastIssue.rpb.priority ?? 0) + taskPriorityIncrement
        : taskPriorityIncrement
      labels.push(createDataLabel('priority', priority))
    }

    isCreatingTask.value = true

    await $httpd('/projects/{rid}/issues', {
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

    await refreshTasks()

    isCreatingTask.value = false
  }

  async function resetPriority() {
    if (!tasks.value) {
      return
    }

    isResettingPriority.value = true

    const partialPriorityLabel = createPartialDataLabel('priority')

    for (const task of tasks.value) {
      const priorityLabelIndex = task.labels.findIndex((label) =>
        label.startsWith(partialPriorityLabel),
      )

      if (priorityLabelIndex !== -1) {
        await updateTaskLabels(task, task.labels.toSpliced(priorityLabelIndex, 1))
      }
    }

    await refreshTasks()
    await initializePriority()

    isResettingPriority.value = false
  }

  return {
    tasksByColumn,
    taskHighlights,
    isReady,
    isLoading,
    isResettingPriority,
    moveTask,
    createIssue,
    resetPriority,
  }
})

function useFilteredTasks() {
  const { tasks } = useTasksFetch()
  const board = useBoardStore()

  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const broadlyFilteredTasks = computed(() => {
    const broadlyFilteredTasks = tasks.value?.filter((task) => {
      // Filter by task kind
      if (board.state.filter.taskKind && board.state.filter.taskKind !== task.rpb.kind) {
        return false
      }

      // Filter done tasks by date
      if (
        board.state.filter.recentDoneTasks &&
        isTaskDone(task) &&
        task.rpb.relevantDate < twoWeeksAgo
      ) {
        return false
      }

      return true
    })

    return broadlyFilteredTasks
  })

  const { queryParams } = useQueryParamsStore()
  const queryRegExp = computed(() => {
    const query = queryParams.query?.trim()
    if (!query) {
      return undefined
    }

    // Wrap query in a capture group (parenthesis) so string.split() keeps the matches in the
    // resulting array
    const queryRegExp = new RegExp(`(${escapeRegExp(query)})`, 'i')

    return queryRegExp
  })

  const filteredTasks = computed<Task[] | undefined>(() => {
    if (!broadlyFilteredTasks.value) {
      return undefined
    }

    const regExp = queryRegExp.value
    if (!regExp) {
      return broadlyFilteredTasks.value
    }

    const filteredTasks = broadlyFilteredTasks.value.filter(
      (task) =>
        regExp.test(task.title) ||
        regExp.test(task.id) ||
        task.labels.some(
          (label) => !label.startsWith(dataLabelNamespace) && regExp.test(label),
        ),
    )

    return filteredTasks
  })

  const taskHighlights = computed(() => {
    const highlights = new Map<string, TaskHighlights>()

    const regExp = queryRegExp.value
    if (!filteredTasks.value || !regExp) {
      return highlights
    }

    for (const task of filteredTasks.value) {
      const taskHighlights = {
        id: task.id.split(regExp),
        title: task.title.split(regExp),
        labels: task.labels.map((label) => {
          if (label.startsWith(dataLabelNamespace)) {
            return [label]
          }
          const segments = label.split(regExp)

          return segments
        }),
      }

      highlights.set(task.id, taskHighlights)
    }

    return highlights
  })

  return { filteredTasks, taskHighlights }
}
