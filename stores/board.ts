import { useStorage } from '@vueuse/core'
import * as v from 'valibot'
import deepMerge from 'deepmerge'
import { initialColumns } from '~/constants/config'

const boardStateSchema = v.object({
  columns: v.array(v.string()),
  filter: v.object({
    taskKind: v.optional(v.picklist(['issue', 'patch'])),
    recentDoneTasks: v.boolean(),
  }),
})

type BoardState = v.InferInput<typeof boardStateSchema>

const initialBoardState: BoardState = {
  columns: initialColumns,
  filter: {
    taskKind: 'issue',
    recentDoneTasks: true,
  },
}

export const useBoardStore = defineStore('board', () => {
  const state = useStorage('RPB_board-state', initialBoardState, localStorage, {
    mergeDefaults: (storageValue, defaults) => {
      return deepMerge(defaults, storageValue, { arrayMerge: overwriteMerge })
    },
  })

  function mergeColumns(parsedColumns: string[]) {
    const updatedColumns = [...new Set([...state.value.columns, ...parsedColumns])]
    if (JSON.stringify(updatedColumns) !== JSON.stringify(state.value.columns)) {
      state.value.columns = updatedColumns
    }
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
      state.value = v.parse(boardStateSchema, JSON.parse(stateString))
    } catch (error) {
      throw new Error('Invalid state', { cause: error })
    }
  }

  function exportState() {
    return JSON.stringify(state.value)
  }

  const store = {
    state,
    mergeColumns,
    moveColumn,
    addColumn,
    removeColumn,
    importState,
    exportState,
  }

  return store
})
