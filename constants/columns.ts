import z from 'zod'

export const columns = ['non-planned', 'todo', 'doing', 'done'] as const

export const columnSchema = z.enum(columns)

export type Column = z.infer<typeof columnSchema>

export type PlannedColumn = Exclude<Column, 'non-planned'>
