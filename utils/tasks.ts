import { initialColumns } from '~/constants/columns'
import { taskPriorityIncrement } from '~/constants/tasks'
import type { RadicleIssue, RadiclePatch } from '~/types/httpd'
import type { Issue, Patch, RadicleTask, Task, TaskProperties } from '~/types/tasks'

const partialColumnDataLabel = createPartialDataLabel('column')
const partialPriorityDataLabel = createPartialDataLabel('priority')

export function isIssue(task: Task): task is Issue {
  return task.rpb.kind === 'issue'
}

export function isPatch(task: Task): task is Patch {
  return task.rpb.kind === 'patch'
}

function getTaskProperties(radicleTask: RadicleTask): TaskProperties {
  let column = 'non-planned'
  let priority: number | null = null

  for (const label of radicleTask.labels) {
    if (label.startsWith(partialColumnDataLabel)) {
      column = getDataLabelValue(label) ?? 'non-planned'
    } else if (label.startsWith(partialPriorityDataLabel)) {
      const value = getDataLabelValue(label)
      priority = value ? Number(value) : null
    }
  }

  const rpbTaskProperties: TaskProperties = {
    column,
    priority,
  }

  return rpbTaskProperties
}

export function transformRadicleIssueToIssue(radicleIssue: RadicleIssue): Issue {
  const issue: Issue = {
    ...radicleIssue,
    rpb: {
      kind: 'issue',
      ...getTaskProperties(radicleIssue),
    },
  }

  return issue
}

export function transformRadiclePatchToPatch(radiclePatch: RadiclePatch): Patch {
  const patch: Patch = {
    ...radiclePatch,
    rpb: {
      kind: 'patch',
      ...getTaskProperties(radiclePatch),
    },
  }

  return patch
}

export function groupTasksByColumn({
  tasks,
  columns,
}: {
  tasks: Task[]
  columns: string[]
}): Record<string, Task[]> {
  const persistedColumns = [...new Set([...columns, ...initialColumns])]
  const persistedTasksByColumn: Record<string, Task[]> = persistedColumns.reduce(
    (columns, column) => ({
      ...columns,
      [column]: [],
    }),
    {},
  )

  const tasksByColumn = tasks.reduce<Record<string, Task[]>>((tasksByColumn, task) => {
    if (task.state.status === 'closed') {
      initializeArrayForKey(tasksByColumn, 'done').push(task)
    } else {
      initializeArrayForKey(tasksByColumn, task.rpb.column).push(task)
    }

    return tasksByColumn
  }, persistedTasksByColumn)

  return tasksByColumn
}

export function createUpdatedTaskLabels(
  task: Task,
  {
    column,
    priority,
  }: {
    column?: string
    priority?: number
  },
): string[] {
  const labels = [...task.labels]

  if (column) {
    const columnDataLabelIndex = labels.findIndex((label) =>
      label.startsWith(partialColumnDataLabel),
    )

    const newColumnDataLabel = createDataLabel('column', column)
    const hasColumnLabel = columnDataLabelIndex !== -1
    const hasCorrectColumnLabel =
      (!hasColumnLabel && column === 'non-planned') ||
      (hasColumnLabel && labels[columnDataLabelIndex] === newColumnDataLabel)

    if (!hasCorrectColumnLabel) {
      if (column === 'non-planned') {
        labels.splice(columnDataLabelIndex, 1)
      } else if (!hasColumnLabel) {
        labels.push(newColumnDataLabel)
      } else {
        labels[columnDataLabelIndex] = newColumnDataLabel
      }
    }
  }

  if (priority !== undefined) {
    const priorityLabelIndex = labels.findIndex((label) =>
      label.startsWith(partialPriorityDataLabel),
    )

    const newPriorityLabel = createDataLabel('priority', priority)
    const hasPriorityLabel = priorityLabelIndex !== -1
    const hasCorrectPriorityLabel =
      hasPriorityLabel && labels[priorityLabelIndex] === newPriorityLabel

    if (!hasCorrectPriorityLabel) {
      if (!hasPriorityLabel) {
        labels.push(newPriorityLabel)
      } else {
        labels[priorityLabelIndex] = newPriorityLabel
      }
    }
  }

  return labels
}

export function orderTasksByColumn(
  tasksByColumn: Record<string, Task[]>,
): Record<string, Task[]> {
  function sortTasksByPriority(tasks: Task[]): Task[] {
    return tasks.toSorted(
      (taskA, taskB) => (taskA.rpb.priority ?? 0) - (taskB.rpb.priority ?? 0),
    )
  }

  const sortedTasksByColumn = Object.fromEntries(
    Object.entries(tasksByColumn).map(([column, tasks]) => [
      column,
      sortTasksByPriority(tasks),
    ]),
  )

  return sortedTasksByColumn
}

function calculateUpdatedTaskPriority({
  tasks,
  id,
  index,
}: {
  tasks: Task[]
  id: string
  index: number
}): number {
  let priority: number | undefined

  const filteredTasks = tasks.filter((task) => task.id !== id)
  const priorities = filteredTasks
    .map((task) => task.rpb.priority ?? 0)
    .toSorted((priorityA, priorityB) => priorityA - priorityB)

  if (index >= priorities.length) {
    priority = (priorities.at(-1) ?? 0) + taskPriorityIncrement
  } else if (index === 0) {
    priority = Math.floor((priorities[0] ?? 0) / 2)
  } else {
    const prevPriority = priorities[index - 1]
    const nextPriority = priorities[index]

    if (prevPriority === undefined || nextPriority === undefined) {
      throw new Error('prevPriority or nextPriority is undefined')
    }

    if (nextPriority - prevPriority <= 1) {
      priority = prevPriority + 1
    } else {
      priority = Math.floor((prevPriority + nextPriority) / 2)
    }
  }

  return priority
}

export function calculatePriorityUpdates({
  tasks,
  task,
  index,
}: {
  tasks: Task[]
  task: Task
  index: number
}): { task: Task; priority: number }[] {
  const newTasks = [...tasks]
  let taskCurrentIndex = newTasks.indexOf(task)
  if (taskCurrentIndex === -1) {
    newTasks.push(task)
    taskCurrentIndex = newTasks.length - 1
  }

  const priorityUpdates: { task: Task; priority: number }[] = []

  const newPriority = calculateUpdatedTaskPriority({ tasks: newTasks, id: task.id, index })
  priorityUpdates.push({ task, priority: newPriority })

  const taskWithDuplicatePriority = newTasks
    .toSpliced(taskCurrentIndex, 1)
    .find((task) => task.rpb.priority === newPriority)

  if (taskWithDuplicatePriority) {
    const taskWithUpdatedPriority: Task = { ...task }
    // typescript complains when trying to pass priority by spreading
    taskWithUpdatedPriority.rpb.priority = newPriority
    const tasksWithUpdatedPriority = newTasks.with(taskCurrentIndex, taskWithUpdatedPriority)

    const updates = calculatePriorityUpdates({
      tasks: tasksWithUpdatedPriority,
      task: taskWithDuplicatePriority,
      index: index + 1,
    })
    priorityUpdates.push(...updates)
  }

  return priorityUpdates
}
