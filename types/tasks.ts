import type { RadicleIssue, RadiclePatch } from './httpd'

export interface TaskProperties {
  column: string
  priority: number | null
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
