import type { RadicleIssue } from './httpd'

export type Issue = RadicleIssue & {
  rpb: {
    column: string
    priority: number | null
  }
}
