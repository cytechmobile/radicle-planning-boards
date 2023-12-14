export const issueStatuses = ['todo', 'doing', 'done'] as const

export type IssueStatus = (typeof issueStatuses)[number]
