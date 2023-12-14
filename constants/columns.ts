import { issueStatuses } from './issues'

export const columnTitles = ['non-planned', ...issueStatuses] as const

export type ColumnTitle = (typeof columnTitles)[number]
