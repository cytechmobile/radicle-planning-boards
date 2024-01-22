import { initialColumns } from '~/constants/columns'
import { issuePriorityIncrement } from '~/constants/issues'
import type { RadicleIssue } from '~/types/httpd'
import type { Issue } from '~/types/issues'

const partialColumnDataLabel = createPartialDataLabel('column')
const partialPriorityDataLabel = createPartialDataLabel('priority')

export function transformIssue(issue: RadicleIssue): Issue {
  let column = 'non-planned'
  let priority: number | null = null

  for (const label of issue.labels) {
    if (label.startsWith(partialColumnDataLabel)) {
      column = getDataLabelValue(label) ?? 'non-planned'
    } else if (label.startsWith(partialPriorityDataLabel)) {
      const value = getDataLabelValue(label)
      priority = value ? Number(value) : null
    }
  }

  const transformedIssue = {
    ...issue,
    rpb: {
      column,
      priority,
    },
  }

  return transformedIssue
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
    if (issue.state.status === 'closed') {
      initializeArrayForKey(issuesByColumn, 'done').push(issue)
    } else {
      initializeArrayForKey(issuesByColumn, issue.rpb.column).push(issue)
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
    return issues.toSorted(
      (issueA, issueB) => (issueA.rpb.priority ?? 0) - (issueB.rpb.priority ?? 0),
    )
  }

  const sortedIssuesByColumn = Object.fromEntries(
    Object.entries(issuesByColumn).map(([column, issues]) => [
      column,
      sortIssuesByPriority(issues),
    ]),
  )

  return sortedIssuesByColumn
}

function calculateUpdatedIssuePriority({
  issues,
  id,
  index,
}: {
  issues: Issue[]
  id: string
  index: number
}): number {
  let priority: number | undefined

  const filteredIssues = issues.filter((issue) => issue.id !== id)
  const priorities = filteredIssues
    .map((issue) => issue.rpb.priority ?? 0)
    .toSorted((priorityA, priorityB) => priorityA - priorityB)

  if (index >= priorities.length) {
    priority = (priorities.at(-1) ?? 0) + issuePriorityIncrement
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
  issues,
  issue,
  index,
}: {
  issues: Issue[]
  issue: Issue
  index: number
}): { issue: Issue; priority: number }[] {
  const newIssues = [...issues]
  let issueCurrentIndex = newIssues.indexOf(issue)
  if (issueCurrentIndex === -1) {
    newIssues.push(issue)
    issueCurrentIndex = newIssues.length - 1
  }

  const priorityUpdates: { issue: Issue; priority: number }[] = []

  const newPriority = calculateUpdatedIssuePriority({ issues: newIssues, id: issue.id, index })
  priorityUpdates.push({ issue, priority: newPriority })

  const issueWithDuplicatePriority = newIssues
    .toSpliced(issueCurrentIndex, 1)
    .find((issue) => issue.rpb.priority === newPriority)

  if (issueWithDuplicatePriority) {
    const issueWithUpdatedPriority = {
      ...issue,
      rpb: {
        ...issue.rpb,
        priority: newPriority,
      },
    }
    const issuesWithUpdatedPriority = newIssues.with(
      issueCurrentIndex,
      issueWithUpdatedPriority,
    )

    const updates = calculatePriorityUpdates({
      issues: issuesWithUpdatedPriority,
      issue: issueWithDuplicatePriority,
      index: index + 1,
    })
    priorityUpdates.push(...updates)
  }

  return priorityUpdates
}
