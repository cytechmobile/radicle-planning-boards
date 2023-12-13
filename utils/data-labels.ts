import type { IssueStatus } from '~/constants/issues'

export const DATA_LABEL_PREFIX = 'RPB' as const

export type DataLabelType = 'status'

export type PartialDataLabel = `${typeof DATA_LABEL_PREFIX}:${DataLabelType}`

export type DataLabel = `${PartialDataLabel}:${IssueStatus}`

export function createPartialDataLabel(type: DataLabelType): PartialDataLabel {
  return `${DATA_LABEL_PREFIX}:${type}`
}

export function createDataLabel(type: DataLabelType, value: IssueStatus): DataLabel {
  return `${createPartialDataLabel(type)}:${value}`
}
