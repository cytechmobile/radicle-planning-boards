import type { RadicleIssue, RadiclePatch } from './httpd'

export interface TaskProperties {
  column: string
  priority: number | undefined
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

/**
 * Represents the text properties of a task to be highlighted.
 *
 * Each string array represents a string, split in segments so that odd indexes are
 * highlighted while even indexes are not.
 *
 * @example
 * ```ts
 * // The **quick** brown fox jumps over the lazy **dog**.
 * ['The ', 'quick', ' brown fox jumps over the lazy ', 'dog', '.']
 * ```
 *
 * @example
 * ```ts
 * // **The** quick brown fox jumps over the lazy **dog.**
 * ['', 'The', ' quick brown fox jumps over the lazy ', 'dog.']
 * ```
 */
export interface TaskHighlights {
  id: string[]
  title: string[]
  labels: string[][]
}
