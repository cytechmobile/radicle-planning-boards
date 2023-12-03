import type { DataLabel } from '~/constants/data-labels'
import type { ISSUE_STATUSES } from '~/constants/issues'

export type IssueStatus = (typeof ISSUE_STATUSES)[number]

type IssueState = { status: 'open' } | { status: 'closed'; reason: 'other' | 'solved' }

interface Author {
  id: string
  alias?: string
}

interface Comment {
  id: string
  author: Author
  body: string
  embeds: { name: string; content: string }[]
  reactions: [string, string][]
  timestamp: number
  replyTo?: string
}

export interface Issue {
  id: string
  author: Author
  title: string
  state: IssueState
  discussion: Comment[]
  labels: (Omit<string, DataLabel> & DataLabel)[] // allow comparing with DataLabel string literals
  assignees: string[]
}
