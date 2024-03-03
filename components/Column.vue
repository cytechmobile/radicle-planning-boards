<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Task } from '../types/tasks'
import { requiredColumns } from '~/constants/columns'
import type { VueDraggableEvent } from '~/types/vue-draggable-plus'

const props = defineProps<{ title: string; tasks: Task[] }>()

const tasksModel = ref<Task[]>([])
const isCreatingNewIssue = ref(false)

const auth = useAuthStore()
const board = useBoardStore()
const tasks = useTasksStore()
const { canEditLabels } = usePermissions()

watchEffect(() => {
  tasksModel.value = [...unref(props.tasks)] // "clone" tasks prop
})

watchEffect(() => {
  if (!auth.isAuthenticated && isCreatingNewIssue.value) {
    isCreatingNewIssue.value = false
  }
})

function handleMoveIssue(event: VueDraggableEvent) {
  const { id } = event.item.dataset
  const { column } = event.to.dataset
  const issue = props.tasks.find((issue) => issue.id === id)
  if (!issue || !column) {
    return
  }

  void tasks.moveTask({
    task: issue,
    column,
    index: event.newIndex,
  })
}

function handleCreate(title: string) {
  void tasks.createIssue({ title, column: props.title })
}

const columnIcon = computed(() => {
  const defaultIcon = { name: 'bx:circle', class: 'text-rad-foreground-contrast' }

  const iconMap = {
    'non-planned': { name: 'bx:loader-circle', class: 'text-rad-foreground-dim' },
    'todo': { name: 'bx:circle', class: 'text-rad-foreground-contrast' },
    'doing': { name: 'bx:adjust', class: 'text-rad-foreground-yellow' },
    'done': { name: 'bx:bxs-circle', class: 'text-rad-foreground-success' },
  }

  if (Object.keys(iconMap).includes(props.title)) {
    return iconMap[props.title as keyof typeof iconMap]
  }

  return defaultIcon
})

const canBeDeleted = computed(() => props.tasks.length === 0)
const isDraggingDisabled = computed(
  () => !auth.isAuthenticated || !canEditLabels || tasks.isLoading,
)
</script>

<template>
  <div
    class="flex min-w-[350px] max-w-[350px] flex-1 flex-col rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <div
      class="flex items-center justify-between gap-2 p-2 hover:cursor-grab"
      data-column-handle
    >
      <div class="flex items-baseline gap-2">
        <Icon :name="columnIcon.name" size="20" :class="`translate-y-1 ${columnIcon.class}`" />
        <h3 class="font-semibold">{{ title }}</h3>

        <small class="text-rad-foreground-gray text-sm font-semibold">
          {{ tasksModel.length }}
        </small>
      </div>

      <div v-if="auth.isAuthenticated" class="flex items-center gap-2">
        <UTooltip
          v-if="!requiredColumns.includes(title)"
          :text="canBeDeleted ? 'Delete column' : 'The column must be empty to be deleted'"
        >
          <IconButton
            label="Delete column"
            icon="bx:trash"
            :disabled="!canBeDeleted"
            @click="board.removeColumn(title)"
          />
        </UTooltip>
        <UTooltip text="New issue">
          <IconButton label="New issue" icon="bx:plus" @click="isCreatingNewIssue = true" />
        </UTooltip>
      </div>
    </div>

    <VueDraggable
      v-model="tasksModel"
      tag="ul"
      class="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2"
      ghost-class="opacity-50"
      :animation="150"
      group="issues"
      :data-column="title"
      :disabled="isDraggingDisabled"
      filter="[data-status='closed']"
      @end="handleMoveIssue($event)"
    >
      <li
        v-for="issue in tasksModel"
        :key="issue.id"
        :data-id="issue.id"
        :data-status="issue.state.status"
        :class="{
          'hover:cursor-grab': !isDraggingDisabled && issue.state.status === 'open',
        }"
      >
        <ColumnTaskCard v-bind="issue" />
      </li>
      <NewColumnIssueCard
        v-if="isCreatingNewIssue"
        @submit="handleCreate"
        @close="isCreatingNewIssue = false"
      />
    </VueDraggable>
  </div>
</template>../types/tasks
