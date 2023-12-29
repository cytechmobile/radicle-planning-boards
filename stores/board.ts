import { initialColumns } from '~/constants/columns'

export const useBoardStore = defineStore('board', () => {
  const columns = ref(initialColumns)

  function mergeColumns(parsedColumns: string[]) {
    columns.value = [...new Set([...columns.value, ...parsedColumns])]
  }

  function addColumn(column: string) {
    if (columns.value.includes(column)) {
      return
    }

    columns.value.push(column)
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
    addColumn,
    removeColumn,
  }

  return store
})
