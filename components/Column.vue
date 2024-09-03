<script setup lang="ts">
import { type SortableEvent, VueDraggable } from 'vue-draggable-plus'
import type { Task } from '../types/tasks'
import { doneTaskStatuses } from '~/constants/tasks'

const props = defineProps<{
  title: string
  tasks: Task[]
  isDefaultColumn?: boolean
  isRequired?: boolean
}>()

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

function handleMoveTask(event: SortableEvent) {
  const { oldIndex, newIndex, item, to } = event
  const { id, kind } = item.dataset
  const { column } = to.dataset
  if (!id || !kind || !column || oldIndex === undefined || newIndex === undefined) {
    throw new Error('Invalid task move event')
  }

  const task = props.tasks.find((task) => task.rpb.kind === kind && task.id === id)
  if (!task || !column || (task.rpb.column === column && oldIndex === newIndex)) {
    return
  }

  tasks.moveTask({
    task,
    column,
    index: newIndex,
  })
}

function handleCreateIssue(title: string) {
  tasks.createIssue({ title, column: props.title })
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

const canBeDeleted = computed(() => !props.isRequired && props.tasks.length === 0)
const canCreateIssue = computed(() => props.isDefaultColumn || canEditLabels)
const isDraggingDisabled = computed(
  () => !auth.isAuthenticated || !canEditLabels || tasks.isLoading,
)
const doneTasksFilter = doneTaskStatuses
  .map((status) => `[data-status='${status}']`)
  .join(', ')
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

        <small class="text-sm font-semibold text-rad-foreground-dim">
          {{ tasksModel.length }}
        </small>
      </div>

      <div class="flex items-center gap-2">
        <slot name="actions"></slot>
        <template v-if="auth.isAuthenticated">
          <UTooltip
            v-if="!isRequired"
            :text="canBeDeleted ? 'Delete column' : 'The column must be empty to be deleted'"
          >
            <IconButton
              label="Delete column"
              icon="bx:trash"
              :disabled="!canBeDeleted"
              @click="board.removeColumn(title)"
            />
          </UTooltip>
          <UTooltip v-if="canCreateIssue" text="New issue">
            <IconButton label="New issue" icon="bx:plus" @click="isCreatingNewIssue = true" />
          </UTooltip>
        </template>
      </div>
    </div>

    <VueDraggable
      v-model="tasksModel"
      tag="ul"
      class="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2"
      ghost-class="opacity-50"
      :animation="150"
      group="tasks"
      :data-column="title"
      :disabled="isDraggingDisabled"
      :filter="doneTasksFilter"
      @end="handleMoveTask($event)"
    >
      <li
        v-for="task in tasksModel"
        :key="`${task.rpb.kind}-${task.id}`"
        :data-id="task.id"
        :data-kind="task.rpb.kind"
        :data-status="task.state.status"
        :class="{
          'hover:cursor-grab': !isDraggingDisabled && !isTaskDone(task),
        }"
      >
        <ColumnIssueCard
          v-if="isIssue(task)"
          :issue="task"
          :highlights="tasks.taskHighlights.get(task.id)"
        />
        <ColumnPatchCard
          v-else-if="isPatch(task)"
          :patch="task"
          :highlights="tasks.taskHighlights.get(task.id)"
        />
      </li>

      <NewColumnIssueCard
        v-if="isCreatingNewIssue"
        @submit="handleCreateIssue"
        @close="isCreatingNewIssue = false"
      />
    </VueDraggable>
  </div>
</template>
