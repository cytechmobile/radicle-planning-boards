import type { ColumnTitle } from '~/constants/columns'
import type { IssueStatus } from '~/constants/issues'
import type { Issue } from '~/types/httpd'

function filterIssuesWithoutStatus(issues: Issue[]): Issue[] {
  const issuesWithoutStatus = issues.filter(
    (issue) =>
      !issue.labels.some((label) => label.startsWith(createPartialDataLabel('status'))),
  )

  return issuesWithoutStatus
}

function filterIssuesByStatus(issues: Issue[], status: IssueStatus): Issue[] {
  const issuesWithStatus = issues.filter((issue) =>
    issue.labels.includes(createDataLabel('status', status)),
  )

  return issuesWithStatus
}

export function useIssuesByColumn(): Record<ColumnTitle, ComputedRef<Issue[]>> {
  const route = useRoute('node-rid')
  const response = useHttpdFetch('/projects/{rid}/issues', {
    path: {
      rid: route.params.rid,
    },
  })

  const issues = response.data as Ref<Issue[] | undefined>

  const issuesByColumn = {
    'non-planned': computed(() => filterIssuesWithoutStatus(issues.value ?? [])),
    'todo': computed(() => filterIssuesByStatus(issues.value ?? [], 'todo')),
    'doing': computed(() => filterIssuesByStatus(issues.value ?? [], 'doing')),
    'done': computed(() => filterIssuesByStatus(issues.value ?? [], 'done')),
  }

  return issuesByColumn
}
