export const columns = ['non-planned', 'todo', 'doing', 'done'] as const

export type Column = (typeof columns)[number]

export type PlannedColumn = Exclude<Column, 'non-planned'>
