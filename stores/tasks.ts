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
  const { tasks, areTasksPending, refetchAllTasks, refetchSpecificTasks, updateTaskLabels } =
    useTasksFetch()
  const route = useRoute('node-rid')
  const permissions = usePermissions()
  const board = useBoardStore()

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

  const { mutate: initializePriority, isPending: isInitializePriorityPending } = useMutation({
    async mutationFn() {
      if (!tasksByColumn.value || !tasksWithoutPriority.value) {
        return
      }

      function getHighestPriorityInColumn(column: string) {
        const columnTasks = tasksByColumn.value?.[column]
        if (!columnTasks) {
          return 0
        }

        return columnTasks.reduce((acc, task) => {
          return task.rpb.priority !== null && task.rpb.priority > acc
            ? task.rpb.priority
            : acc
        }, 0)
      }

      const highestPriorityByColumn: Record<string, number> = {}
      const taskIndexByColumn: Record<string, number> = {}

      for (const task of tasksWithoutPriority.value) {
        const { column } = task.rpb

        if (highestPriorityByColumn[column] === undefined) {
          highestPriorityByColumn[column] = getHighestPriorityInColumn(column)
        }

        if (taskIndexByColumn[column] === undefined) {
          taskIndexByColumn[column] = 0
        } else {
          taskIndexByColumn[column]++
        }

        const priority =
          (highestPriorityByColumn[column] ?? 0) +
          ((taskIndexByColumn[column] ?? 0) + 1) * taskPriorityIncrement

        await updateTaskLabels(task, [...task.labels, createDataLabel('priority', priority)])
      }
    },
    onSettled() {
      void refetchAllTasks()
    },
  })

  watchEffect(() => {
    if (tasksWithoutPriority.value?.length) {
      initializePriority()
    }
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
      void refetchSpecificTasks(tasksToRefresh)
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
      void refetchAllTasks()
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

  const isLoading = computed(
    () =>
      areTasksPending.value || isCreateIssuePending.value || isInitializePriorityPending.value,
  )

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
