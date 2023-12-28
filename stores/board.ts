import { initialColumns } from '~/constants/columns'

export const useBoardStore = defineStore('board', () => {
  const columns = ref(initialColumns)

  function mergeColumns(parsedColumns: string[]) {
    columns.value = [...new Set([...columns.value, ...parsedColumns])]
  }

  const store = {
    columns,
    mergeColumns,
  }

  return store
})
