import type { PlannedColumn } from '~/constants/columns'

export const dataLabelNamespace = 'RPB'

export type DataLabelKind = 'column'

export type PartialDataLabel = `${typeof dataLabelNamespace}:${DataLabelKind}`

export type DataLabel = `${PartialDataLabel}:${PlannedColumn}`

export function createPartialDataLabel(type: DataLabelKind): PartialDataLabel {
  return `${dataLabelNamespace}:${type}`
}

export function createDataLabel(type: DataLabelKind, value: PlannedColumn): DataLabel {
  return `${createPartialDataLabel(type)}:${value}`
}
