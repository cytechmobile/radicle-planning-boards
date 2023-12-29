import { useStorage } from '@vueuse/core'
import { initialColumns } from '~/constants/columns'

export const useBoardStore = defineStore('board', () => {
  const state = useStorage('RPB_board-state', {
    columns: initialColumns,
  })
  const columns = computed(() => state.value.columns)

  function mergeColumns(parsedColumns: string[]) {
    state.value.columns = [...new Set([...state.value.columns, ...parsedColumns])]
  }

  function addColumn(column: string) {
    if (state.value.columns.includes(column)) {
      return
    }

    state.value.columns.push(column)
  }

  function removeColumn(column: string) {
    const columnIndex = state.value.columns.indexOf(column)
    if (columnIndex !== -1) {
      state.value.columns.splice(columnIndex, 1)
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
