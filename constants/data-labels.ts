import type { IssueStatus } from '~/types/issues'

export const DATA_LABEL_PREFIX = 'RBP' as const

export type DataLabelType = 'status'

export type DataLabel = `${typeof DATA_LABEL_PREFIX}:${DataLabelType}:${IssueStatus}`
