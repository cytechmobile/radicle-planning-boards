export type IssueStatus = 'todo' | 'doing' | 'done'

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
  labels: string[]
  assignees: string[]
}
