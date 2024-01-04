import { initialColumns } from '~/constants/columns'
import type { Issue } from '~/types/httpd'

const partialColumnDataLabel = createPartialDataLabel('column')

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

export function createUpdatedIssueLabels(issue: Issue, column: string): string[] {
  const columnDataLabelIndex = issue.labels.findIndex((label) =>
    label.startsWith(partialColumnDataLabel),
  )

  if (column === 'non-planned') {
    return columnDataLabelIndex === -1
      ? issue.labels
      : issue.labels.toSpliced(columnDataLabelIndex, 1)
  }

  return columnDataLabelIndex === -1
    ? issue.labels.concat(createDataLabel('column', column))
    : issue.labels.with(columnDataLabelIndex, createDataLabel('column', column))
}

export function orderIssuesByColumn(
  issuesByColumn: Record<string, Issue[]>,
  issuesOrderByColumn: Record<string, string[]>,
): Record<string, Issue[]> {
  function sortIssues(issues: Issue[], order: string[]): Issue[] {
    return issues.toSorted((issueA, issueB) => {
      const aIndex = order.indexOf(issueA.id)
      const bIndex = order.indexOf(issueB.id)

      if (aIndex === undefined && bIndex === undefined) {
        return 0
      }
      if (aIndex === undefined) {
        return 1
      }
      if (bIndex === undefined) {
        return -1
      }

      return aIndex - bIndex
    })
  }

  const sortedIssuesByColumn = Object.fromEntries(
    Object.entries(issuesByColumn).map(([column, issues]) => [
      column,
      sortIssues(issues, issuesOrderByColumn[column] ?? []),
    ]),
  )

  return sortedIssuesByColumn
}
