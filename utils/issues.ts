import type { Column } from '~/constants/columns'
import type { Issue } from '~/types/httpd'

export function groupIssuesByColumn(issues: Issue[]): Record<Column, Issue[]> {
  const partialColumnDataLabel = createPartialDataLabel('column')

  const issuesByColumn = issues.reduce<Record<Column, Issue[]>>(
    (issuesByColumn, issue) => {
      let issueColumn: string | undefined

      for (const label of issue.labels) {
        if (label.startsWith(partialColumnDataLabel)) {
          issueColumn = label.split(':')[2]
          break
        }
      }

      if (issue.state.status === 'closed') {
        issuesByColumn.done.push(issue)
      } else if (issueColumn === 'todo' || issueColumn === 'doing' || issueColumn === 'done') {
        issuesByColumn[issueColumn].push(issue)
      } else {
        issuesByColumn['non-planned'].push(issue)
      }

      return issuesByColumn
    },
    {
      'non-planned': [],
      'todo': [],
      'doing': [],
      'done': [],
    },
  )

  return issuesByColumn
}

export function createUpdatedIssueLabels(issue: Issue, column: Column): string[] {
  const partialColumnLabel = createPartialDataLabel('column')

  const columnDataLabelIndex = issue.labels.findIndex((label) =>
    label.startsWith(partialColumnLabel),
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
