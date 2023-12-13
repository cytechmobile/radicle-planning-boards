import { ISSUE_STATUSES } from './issues'

export const COLUMN_TITLES = ['not-planned', ...ISSUE_STATUSES] as const

export type ColumnTitle = (typeof COLUMN_TITLES)[number]
