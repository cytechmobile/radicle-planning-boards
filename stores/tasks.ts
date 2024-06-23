import { taskPriorityIncrement } from '~/constants/tasks'
import type { Task } from '~/types/tasks'

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

  const filteredTasks = useFilteredTasks()
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

  const broadlyFilteredTasksAndSearchableFields = computed(() => {
    function filterAndLowercaseLabels(labels: string[]): string[] {
      const filteredLabels: string[] = []
      for (const label of labels) {
        if (!label.startsWith(dataLabelNamespace)) {
          filteredLabels.push(label.toLowerCase())
        }
      }

      return filteredLabels
    }

    if (!tasks.value) {
      return undefined
    }

    const broadlyFilteredTasksAndSearchableFields: {
      task: Task
      searchableFields: string[]
    }[] = []

    for (const task of tasks.value) {
      // Filter by task kind
      if (board.state.filter.taskKind && board.state.filter.taskKind !== task.rpb.kind) {
        continue
      }

      // Filter done tasks by date
      if (
        board.state.filter.recentDoneTasks &&
        isTaskDone(task) &&
        task.rpb.relevantDate < twoWeeksAgo
      ) {
        continue
      }

      const searchableFields = [
        task.title.toLowerCase(),
        task.id.toLowerCase(),
        ...filterAndLowercaseLabels(task.labels),
      ]

      broadlyFilteredTasksAndSearchableFields.push({ task, searchableFields })
    }

    return broadlyFilteredTasksAndSearchableFields
  })

  const filteredTasks = computed(() => {
    if (!broadlyFilteredTasksAndSearchableFields.value) {
      return undefined
    }

    const query = board.state.filter.query?.trim().toLowerCase()

    if (!query) {
      const tasks = broadlyFilteredTasksAndSearchableFields.value.map(({ task }) => task)

      return tasks
    }

    const filteredTasks: Task[] = []
    for (const { task, searchableFields } of broadlyFilteredTasksAndSearchableFields.value) {
      if (searchableFields.some((field) => field.includes(query))) {
        filteredTasks.push(task)
      }
    }

    return filteredTasks
  })

  return filteredTasks
}
