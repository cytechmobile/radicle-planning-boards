export const dataLabelNamespace = 'RPB'

export type DataLabelKind = 'column' | 'priority'

export type PartialDataLabel = `${typeof dataLabelNamespace}:${DataLabelKind}`

export type DataLabel = `${PartialDataLabel}:${string}`

export function createPartialDataLabel(type: DataLabelKind): PartialDataLabel {
  return `${dataLabelNamespace}:${type}`
}

export function createDataLabel(type: 'column', value: string): DataLabel
export function createDataLabel(type: 'priority', value: number): DataLabel

export function createDataLabel(type: DataLabelKind, value: string | number): DataLabel {
  return `${createPartialDataLabel(type)}:${value}`
}
