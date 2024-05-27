import { useMutation } from '@tanstack/vue-query'
import { taskPriorityIncrement } from '~/constants/tasks'
import type { Task } from '~/types/tasks'

interface TaskPositionUpdate {
  task: Task
  labels: string[]
  rpb: Task['rpb']
}

export const useTasksStore = defineStore('tasks', () => {
  const { $httpd } = useNuxtApp()
  const { tasks, areTasksPending, refreshAllTasks, refreshSpecificTasks, updateTaskLabels } =
    useTasksFetch()
  const route = useRoute('node-rid')
  const permissions = usePermissions()
  const board = useBoardStore()

  const isReady = ref(false)

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

  const tasksSummary = computed(() => {
    if (!permissions.canEditLabels || !tasks.value) {
      return null
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

    return {
      tasksWithoutPriority,
      highestPriority,
    }
  })

  const { mutate: initializePriority } = useMutation({
    async mutationFn() {
      if (!tasksSummary.value) {
        return
      }

      const { tasksWithoutPriority, highestPriority } = tasksSummary.value

      for (const [index, task] of tasksWithoutPriority.entries()) {
        const priority = highestPriority + (index + 1) * taskPriorityIncrement

        await updateTaskLabels(task, [...task.labels, createDataLabel('priority', priority)])
      }
    },
    onSettled() {
      void refreshAllTasks()
    },
  })

  const { mutate: optimisticallyUpdateTasksPositions } = useMutation({
    async mutationFn(positionUpdates: TaskPositionUpdate[]) {
      await Promise.all(
        positionUpdates.map(async ({ task, labels }) => {
          await updateTaskLabels(task, labels)
        }),
      )
    },
    onMutate(positionUpdates) {
      positionUpdates.forEach(({ task, labels, rpb }) => {
        task.labels = labels
        task.rpb = rpb
      })
    },
    onSettled(data, error, positionUpdates) {
      const tasksToRefresh = positionUpdates.map(({ task }) => task)
      void refreshSpecificTasks(tasksToRefresh)
    },
  })

  function moveTask({ task, column, index }: { task: Task; column: string; index: number }) {
    const columnTasks = tasksByColumn.value?.[column]
    if (!columnTasks) {
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

    const positionUpdates: TaskPositionUpdate[] = priorityUpdates.map(
      ({ task, priority }, index) => {
        // Only the first task may change columns since the rest are being moved
        // within the same column to avoid conflicts
        const newColumn = index === 0 ? column : task.rpb.column

        return {
          task,
          labels: createUpdatedTaskLabels(task, {
            priority,
            column: newColumn,
          }),
          rpb: {
            ...task.rpb,
            priority,
            column: newColumn,
          },
        }
      },
    )

    optimisticallyUpdateTasksPositions(positionUpdates)
  }

  const { mutate: createIssue, isPending: isCreateIssuePending } = useMutation({
    async mutationFn({ title, column }: { title: string; column: string }) {
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
    },
    onSuccess() {
      void refreshAllTasks()
    },
  })

  const { mutate: resetPriority, isPending: isResetPriorityPending } = useMutation({
    async mutationFn() {
      if (!permissions.canEditLabels || !tasks.value) {
        return
      }

      const partialPriorityLabel = createPartialDataLabel('priority')

      for (const task of tasks.value) {
        const priorityLabelIndex = task.labels.findIndex((label) =>
          label.startsWith(partialPriorityLabel),
        )

        if (priorityLabelIndex !== -1) {
          await updateTaskLabels(task, task.labels.toSpliced(priorityLabelIndex, 1))
        }
      }
    },
    onSettled() {
      void refreshAllTasks()
    },
  })

  watchEffect(() => {
    if (!isReady.value && tasks.value) {
      isReady.value = true
    }
  })

  // Initialize priority for tasks without priority
  watchEffect(() => {
    if (tasksSummary.value && tasksSummary.value.tasksWithoutPriority.length > 0) {
      initializePriority()
    }
  })

  // Merge task-derived columns with existing columns
  watchEffect(() => {
    if (tasksByColumn.value) {
      board.mergeColumns(Object.keys(tasksByColumn.value))
    }
  })

  const isLoading = computed(() => areTasksPending.value || isCreateIssuePending.value)

  const store = {
    tasksByColumn,
    isReady,
    isLoading,
    isResetPriorityPending,
    moveTask,
    createIssue,
    resetPriority,
  }

  return store
})
