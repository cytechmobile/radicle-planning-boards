export const ISSUE_STATUSES = ['todo', 'doing', 'done'] as const

export type IssueStatus = (typeof ISSUE_STATUSES)[number]
