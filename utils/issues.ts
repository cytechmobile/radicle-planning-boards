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

      if (issueColumn === 'todo' || issueColumn === 'doing' || issueColumn === 'done') {
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
