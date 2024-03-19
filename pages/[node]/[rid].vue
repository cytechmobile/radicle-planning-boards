<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { VueDraggableEvent } from '~/types/vue-draggable-plus'

const auth = useAuthStore()
const tasks = useTasksStore()
const board = useBoardStore()

const columnsModel = ref<string[]>([...board.state.columns])

watchEffect(() => {
  if (JSON.stringify(columnsModel.value) !== JSON.stringify(board.state.columns)) {
    columnsModel.value = [...board.state.columns]
  }
})

function handleMoveColumn({ oldIndex, newIndex }: VueDraggableEvent) {
  const column = board.state.columns[oldIndex]
  if (!column) {
    return
  }

  board.moveColumn({
    name: column,
    newIndex,
  })
}
</script>

<template>
  <div
    v-if="columnsModel"
    class="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden px-4 pb-4"
  >
    <VueDraggable
      v-model="columnsModel"
      class="flex gap-4"
      group="columns"
      :animation="300"
      handle="[data-column-handle]"
      @update="handleMoveColumn"
    >
      <Column
        v-for="column in columnsModel"
        :key="column"
        :title="column"
        :tasks="tasks.tasksByColumn?.[column] ?? []"
      />
    </VueDraggable>
    <NewColumn v-if="auth.isAuthenticated" />
  </div>
</template>
