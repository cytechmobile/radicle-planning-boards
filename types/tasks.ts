import type { RadicleIssue, RadiclePatch } from './httpd'

export interface TaskProperties {
  column: string
  priority: number | null
  /**
   * The date used to filter tasks by. (creation date for issues, latest revision date for patches)
   */
  relevantDate: Date
}

export type Issue = RadicleIssue & {
  rpb: TaskProperties & {
    kind: 'issue'
  }
}

export type Patch = RadiclePatch & {
  rpb: TaskProperties & {
    kind: 'patch'
  }
}

export type RadicleTask = RadicleIssue | RadiclePatch

export type Task = Issue | Patch
