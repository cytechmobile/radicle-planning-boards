import type { ColumnTitle } from '~/constants/columns'
import type { Issue } from '~/types/httpd'

export function groupIssuesByColumn(issues: Issue[]): Record<ColumnTitle, Issue[]> {
  const partialStatusLabel = createPartialDataLabel('status')

  const issuesByColumn = issues.reduce<Record<ColumnTitle, Issue[]>>(
    (issuesByColumn, issue) => {
      let issueStatus: string | undefined

      for (const label of issue.labels) {
        if (label.startsWith(partialStatusLabel)) {
          issueStatus = label.split(':')[2]
          break
        }
      }

      if (issueStatus === 'todo' || issueStatus === 'doing' || issueStatus === 'done') {
        issuesByColumn[issueStatus].push(issue)
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
