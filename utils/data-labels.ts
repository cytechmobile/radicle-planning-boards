import type { IssueStatus } from '~/constants/issues'

export const dataLabelNamespace = 'RPB'

export type DataLabelKind = 'status'

export type PartialDataLabel = `${typeof dataLabelNamespace}:${DataLabelKind}`

export type DataLabel = `${PartialDataLabel}:${IssueStatus}`

export function createPartialDataLabel(type: DataLabelKind): PartialDataLabel {
  return `${dataLabelNamespace}:${type}`
}

export function createDataLabel(type: DataLabelKind, value: IssueStatus): DataLabel {
  return `${createPartialDataLabel(type)}:${value}`
}
