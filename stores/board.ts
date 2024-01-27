import { useStorage } from '@vueuse/core'
import z from 'zod'
import { initialColumns } from '~/constants/columns'

const boardStateSchema = z.object({
  columns: z.array(z.string()),
})

type BoardState = z.infer<typeof boardStateSchema>

const initialBoardState = {
  columns: initialColumns,
} satisfies BoardState

export const useBoardStore = defineStore('board', () => {
  const state = useStorage('RPB_board-state', initialBoardState)
  const columns = computed(() => state.value.columns)

  function mergeColumns(parsedColumns: string[]) {
    state.value.columns = [...new Set([...state.value.columns, ...parsedColumns])]
  }

  function moveColumn({ name, newIndex }: { name: string; newIndex: number }) {
    const oldIndex = state.value.columns.indexOf(name)
    if (oldIndex === -1) {
      return
    }

    state.value.columns.splice(oldIndex, 1)
    state.value.columns.splice(newIndex, 0, name)
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

  function importState(stateString: string) {
    try {
      state.value = boardStateSchema.parse(JSON.parse(stateString))
    } catch (error) {
      throw new Error('Invalid state', { cause: error })
    }
  }

  function exportState() {
    return JSON.stringify(state.value)
  }

  const store = {
    columns,
    mergeColumns,
    moveColumn,
    addColumn,
    removeColumn,
    importState,
    exportState,
  }

  return store
})
