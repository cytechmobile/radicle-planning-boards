<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

const auth = useAuthStore()
const issues = useIssuesStore()

const columnsModel = ref<string[]>([])

const columns = computed(() =>
  issues.issuesByColumn ? Object.keys(issues.issuesByColumn) : null,
)

watchEffect(() => {
  if (columns.value) {
    columnsModel.value = [...columns.value]
  }
})
</script>

<template>
  <div v-if="columns" class="flex flex-1 gap-4 overflow-x-auto px-4 pb-4">
    <VueDraggable
      v-model="columnsModel"
      class="flex gap-4"
      ghost-class="opacity-50"
      group="columns"
      :animation="150"
    >
      <Column
        v-for="column in columns"
        :key="column"
        :title="column"
        :issues="issues.issuesByColumn?.[column] ?? []"
      />
    </VueDraggable>
    <NewColumn v-if="auth.isAuthenticated" />
  </div>
</template>
