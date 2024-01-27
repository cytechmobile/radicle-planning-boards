<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

const auth = useAuthStore()
const issues = useIssuesStore()
const board = useBoardStore()

const columnsModel = ref<string[]>([])

watchEffect(() => {
  columnsModel.value = [...board.columns]
})

function handleUpdate({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) {
  const column = board.columns[oldIndex]
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
  <div v-if="columnsModel" class="flex flex-1 gap-4 overflow-x-auto px-4 pb-4">
    <VueDraggable
      v-model="columnsModel"
      class="flex gap-4"
      ghost-class="opacity-50"
      group="columns"
      :animation="150"
      @update="handleUpdate"
    >
      <Column
        v-for="column in columnsModel"
        :key="column"
        :title="column"
        :issues="issues.issuesByColumn?.[column] ?? []"
      />
    </VueDraggable>
    <NewColumn v-if="auth.isAuthenticated" />
  </div>
</template>
