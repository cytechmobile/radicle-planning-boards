import { initialColumns } from '~/constants/columns'

export const useBoardStore = defineStore('board', () => {
  const columns = ref(initialColumns)

  function mergeColumns(parsedColumns: string[]) {
    columns.value = [...new Set([...columns.value, ...parsedColumns])]
  }

  function removeColumn(column: string) {
    const columnIndex = columns.value.indexOf(column)
    if (columnIndex !== -1) {
      columns.value.splice(columnIndex, 1)
    }
  }

  const store = {
    columns,
    mergeColumns,
    removeColumn,
  }

  return store
})
