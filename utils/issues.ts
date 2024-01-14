import { initialColumns } from '~/constants/columns'
import { issuePriorityIncrement } from '~/constants/issues'
import type { Issue } from '~/types/httpd'

const partialColumnDataLabel = createPartialDataLabel('column')
const partialPriorityDataLabel = createPartialDataLabel('priority')

function getIssuePriority(issue: Issue): number | null {
  const priorityLabel = issue.labels.find((label) => label.startsWith('RPB:priority:'))
  if (!priorityLabel) {
    return null
  }
  const priority = Number(priorityLabel.split(':')[2])
  if (Number.isNaN(priority)) {
    return null
  }

  return priority
}

export function groupIssuesByColumn(issues: Issue[]): Record<string, Issue[]> {
  const initialIssuesByColumn: Record<string, Issue[]> = initialColumns.reduce(
    (columns, column) => ({
      ...columns,
      [column]: [],
    }),
    {},
  )

  const issuesByColumn = issues.reduce<Record<string, Issue[]>>((issuesByColumn, issue) => {
    let parsedIssueColumn: string | undefined

    for (const label of issue.labels) {
      if (label.startsWith(partialColumnDataLabel)) {
        parsedIssueColumn = label.split(':')[2]
        break
      }
    }

    if (issue.state.status === 'closed') {
      initializeArrayForKey(issuesByColumn, 'done').push(issue)
    } else if (parsedIssueColumn === undefined || parsedIssueColumn === '') {
      initializeArrayForKey(issuesByColumn, 'non-planned').push(issue)
    } else {
      initializeArrayForKey(issuesByColumn, parsedIssueColumn).push(issue)
    }

    return issuesByColumn
  }, initialIssuesByColumn)

  return issuesByColumn
}

interface CreateUpdatedIssueLabelsOptions {
  column?: string
  priority?: number
}

export function createUpdatedIssueLabels(
  issue: Issue,
  { column, priority }: CreateUpdatedIssueLabelsOptions,
): string[] {
  const labels = [...issue.labels]

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

export function orderIssuesByColumn(
  issuesByColumn: Record<string, Issue[]>,
): Record<string, Issue[]> {
  function sortIssuesByPriority(issues: Issue[]): Issue[] {
    return issues.toSorted((issueA, issueB) => {
      const aPriority = getIssuePriority(issueA) ?? 0
      const bPriority = getIssuePriority(issueB) ?? 0

      return aPriority - bPriority
    })
  }

  const sortedIssuesByColumn = Object.fromEntries(
    Object.entries(issuesByColumn).map(([column, issues]) => [
      column,
      sortIssuesByPriority(issues),
    ]),
  )

  return sortedIssuesByColumn
}

export function calculateUpdatedIssuePriority({
  issues,
  id,
  newIndex,
}: {
  issues: Issue[]
  id: string
  newIndex: number
}): number {
  let priority: number | undefined

  const filteredIssues = issues.filter((issue) => issue.id !== id)
  const priorities = filteredIssues
    .map((issue) => getIssuePriority(issue) ?? 0)
    .toSorted((priorityA, priorityB) => priorityA - priorityB)

  if (newIndex >= priorities.length) {
    priority = (priorities.at(-1) ?? 0) + issuePriorityIncrement
  } else if (newIndex === 0) {
    priority = Math.floor((priorities[0] ?? 0) / 2)
  } else {
    const prevPriority = priorities[newIndex - 1]
    const nextPriority = priorities[newIndex]

    if (prevPriority === undefined || nextPriority === undefined) {
      throw new Error('prevPriority or nextPriority is undefined')
    }

    priority = Math.floor((prevPriority + nextPriority) / 2)
  }

  return priority
}
