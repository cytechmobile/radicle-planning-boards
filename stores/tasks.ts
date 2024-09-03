import { useMutation } from '@tanstack/vue-query'
import { taskPriorityIncrement } from '~/constants/tasks'
import type { Task, TaskHighlights } from '~/types/tasks'

interface TaskPositionUpdate {
  task: Task
  labels: string[]
  rpb: Task['rpb']
}

export const useTasksStore = defineStore('tasks', () => {
  const { $httpd } = useNuxtApp()
  const {
    tasks,
    areTasksPending,
    fetchIssueByIdAndAddToTasks,
    refetchAllTasks,
    refetchSpecificTasks,
    updateTaskLabels,
  } = useTasksFetch()
  const route = useRoute('node-rid')
  const permissions = usePermissions()
  const board = useBoardStore()

  const { filteredTasks, taskHighlights } = useFilteredTasks()
  const tasksByColumn = computed(() => {
    if (filteredTasks.value === undefined) {
      return undefined
    }

    const tasksByColumn = orderTasksByColumn(
      groupTasksByColumn({
        tasks: filteredTasks.value,
        columns: board.state.columns,
      }),
    )

    return tasksByColumn
  })

  interface OptimisticallyUpdateTasksPositionsOptions {
    positionUpdates: TaskPositionUpdate[]
    refetchAllTasksOnError?: boolean
  }
  const { mutate: optimisticallyUpdateTasksPositions } = useMutation({
    async mutationFn({ positionUpdates }: OptimisticallyUpdateTasksPositionsOptions) {
      await Promise.all(
        positionUpdates.map(async ({ task, labels }) => {
          await updateTaskLabels(task, labels)
        }),
      )
    },
    onMutate({ positionUpdates }) {
      positionUpdates.forEach(({ task, labels, rpb }) => {
        task.labels = labels
        task.rpb = rpb
      })
    },
    onError(_, { positionUpdates, refetchAllTasksOnError }) {
      if (refetchAllTasksOnError) {
        void refetchAllTasks()

        return
      }

      const tasksToRefresh = positionUpdates.map(({ task }) => task)
      void refetchSpecificTasks(tasksToRefresh)
    },
  })

  const tasksWithoutPriority = computed(() => {
    if (!permissions.canEditLabels || !tasks.value) {
      return null
    }

    const tasksWithoutPriority: Task[] = []

    for (const task of tasks.value) {
      if (task.rpb.priority === null) {
        tasksWithoutPriority.push(task)
      }
    }

    return tasksWithoutPriority
  })

  function getColumnTopPriority(column: string) {
    const topPriorityTask = tasksByColumn.value?.[column]?.findLast(
      (task) => task.rpb.priority !== null,
    )
    const topPriority = topPriorityTask?.rpb.priority ?? 0

    return topPriority
  }

  function initializeTasksPriority() {
    if (!tasksByColumn.value || !tasksWithoutPriority.value) {
      return
    }

    const topPriorityByColumn: Record<string, number> = {}
    const taskIndexByColumn: Record<string, number> = {}
    const positionUpdates: TaskPositionUpdate[] = []

    for (const task of tasksWithoutPriority.value) {
      const { column } = task.rpb

      if (topPriorityByColumn[column] === undefined) {
        topPriorityByColumn[column] = getColumnTopPriority(column)
      }

      if (taskIndexByColumn[column] === undefined) {
        taskIndexByColumn[column] = 0
      } else {
        taskIndexByColumn[column]++
      }

      const priority =
        topPriorityByColumn[column] + (taskIndexByColumn[column] + 1) * taskPriorityIncrement

      positionUpdates.push({
        task,
        labels: createUpdatedTaskLabels(task, { priority }),
        rpb: { ...task.rpb, priority },
      })
    }

    optimisticallyUpdateTasksPositions({ positionUpdates, refetchAllTasksOnError: true })
  }

  watchEffect(() => {
    if (tasksByColumn.value && tasksWithoutPriority.value?.length) {
      initializeTasksPriority()
    }
  })

  function moveTask({ task, column, index }: { task: Task; column: string; index: number }) {
    if (!tasksByColumn.value?.[column]) {
      return
    }

    const priorityUpdates = calculatePriorityUpdates({
      tasks: tasksByColumn.value[column],
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

    optimisticallyUpdateTasksPositions({ positionUpdates })
  }

  const { mutate: createIssue, isPending: isCreateIssuePending } = useMutation({
    async mutationFn({ title, column }: { title: string; column: string }) {
      if (tasksByColumn.value?.[column] === undefined) {
        return undefined
      }

      const labels: string[] = []

      if (permissions.canEditLabels) {
        if (column !== 'non-planned') {
          labels.push(createDataLabel('column', column))
        }

        const priority = getColumnTopPriority(column) + taskPriorityIncrement
        labels.push(createDataLabel('priority', priority))
      }

      const { id } = await $httpd('/projects/{rid}/issues', {
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

      return id
    },
    onSuccess(id) {
      if (id) {
        fetchIssueByIdAndAddToTasks(id)
      }
    },
  })

  function resetPriority() {
    if (!permissions.canEditLabels || !tasks.value) {
      return
    }

    const partialPriorityLabel = createPartialDataLabel('priority')

    for (const task of tasks.value) {
      const priorityLabelIndex = task.labels.findIndex((label) =>
        label.startsWith(partialPriorityLabel),
      )

      if (priorityLabelIndex !== -1) {
        task.labels.splice(priorityLabelIndex, 1)
        task.rpb.priority = null
      }
    }
  }

  // Merge task-derived columns with existing columns
  watchEffect(() => {
    if (tasksByColumn.value) {
      board.mergeColumns(Object.keys(tasksByColumn.value))
    }
  })

  const isLoading = computed(() => areTasksPending.value || isCreateIssuePending.value)

  return {
    tasksByColumn,
    taskHighlights,
    isLoading,
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
  twoWeeksAgo.setHours(0, 0, 0, 0)

  const broadlyFilteredTasks = computed(() => {
    const broadlyFilteredTasks = tasks.value?.filter((task) => {
      if (board.state.filter.taskKind && board.state.filter.taskKind !== task.rpb.kind) {
        return false
      }

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
    const query = queryParams.filter?.trim()
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
