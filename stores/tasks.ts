import { taskPriorityIncrement } from '~/constants/tasks'
import type { Task } from '~/types/tasks'

export const useTasksStore = defineStore('tasks', () => {
  const { $httpd } = useNuxtApp()
  const { tasks, areTasksPending, refreshTasks, refreshSpecificTasks, updateTaskLabels } =
    useTasksFetch()
  const route = useRoute()

  const permissions = usePermissions()
  const board = useBoardStore()

  const isCreatingTask = ref(false)
  const isResettingPriority = ref(false)

  const isLoading = computed(() => areTasksPending.value || isCreatingTask.value)

  const tasksByColumn = computed(() => {
    if (tasks.value === null) {
      return null
    }

    const orderedTasks = orderTasksByColumn(
      groupTasksByColumn({
        tasks: tasks.value,
        columns: board.state.columns,
      }),
    )

    return orderedTasks
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

  watch(
    () => [permissions.canEditLabels, tasks.value],
    ([canEditLabels, newTasks], [_, oldTasks]) => {
      // Only initialize task priority on first fetch
      if (canEditLabels && newTasks && !oldTasks) {
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

    if (column !== 'non-planned') {
      labels.push(createDataLabel('column', column))
    }

    const lastIssue = columnIssues.at(-1)
    const priority = lastIssue
      ? (lastIssue.rpb.priority ?? 0) + taskPriorityIncrement
      : taskPriorityIncrement
    labels.push(createDataLabel('priority', priority))

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
