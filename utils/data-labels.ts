export const dataLabelNamespace = 'RPB'

export type DataLabelKind = 'column'

export type PartialDataLabel = `${typeof dataLabelNamespace}:${DataLabelKind}`

export type DataLabel = `${PartialDataLabel}:${string}`

export function createPartialDataLabel(type: DataLabelKind): PartialDataLabel {
  return `${dataLabelNamespace}:${type}`
}

export function createDataLabel(type: DataLabelKind, value: string): DataLabel {
  return `${createPartialDataLabel(type)}:${value}`
}
