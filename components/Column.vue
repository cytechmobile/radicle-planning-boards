<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Issue } from '../types/httpd'
import type { Column } from '~/constants/columns'

interface VueDraggableAddEvent {
  item: HTMLElement
  from: HTMLElement
  to: HTMLElement
  oldIndex: number
  newIndex: number
}

interface VueDraggableUpdateEvent {
  item: HTMLElement
  from: HTMLElement
  oldIndex: number
  newIndex: number
}

const props = defineProps<{ title: Column; issues: Issue[] }>()
const emit = defineEmits<{
  add: [data: { id: string; from: string; to: string; oldIndex: number; newIndex: number }]
  update: [data: { id: string; from: string; oldIndex: number; newIndex: number }]
}>()

const issuesModel = ref<Issue[]>([])

const auth = useAuthStore()

watchEffect(() => {
  issuesModel.value = [...unref(props.issues)] // "clone" issues prop
})

function handleAdd(event: VueDraggableAddEvent) {
  const { id } = event.item.dataset
  const { column: fromColumn } = event.from.dataset
  const { column: toColumn } = event.to.dataset
  if (!id || !toColumn || !fromColumn) {
    return
  }

  emit('add', {
    id,
    from: fromColumn,
    to: toColumn,
    oldIndex: event.oldIndex,
    newIndex: event.newIndex,
  })
}

function handleUpdate(event: VueDraggableUpdateEvent) {
  const { id } = event.item.dataset
  const { column: fromColumn } = event.from.dataset
  if (!id || !fromColumn) {
    return
  }

  emit('update', { id, from: fromColumn, oldIndex: event.oldIndex, newIndex: event.newIndex })
}

const columnLabelToIconMap = {
  'non-planned': { name: 'bx:loader-circle', class: 'text-rad-foreground-dim' },
  'todo': { name: 'bx:circle', class: 'text-rad-foreground-contrast' },
  'doing': { name: 'bx:adjust', class: 'text-rad-foreground-yellow' },
  'done': { name: 'bx:bxs-circle', class: 'text-rad-foreground-success' },
} satisfies Record<Column, { name: string; class: string }>
</script>

<template>
  <div
    class="flex min-w-[350px] max-w-[350px] flex-1 flex-col rounded border border-rad-border-hint bg-rad-background-dip"
  >
    <div class="flex items-baseline gap-2 p-2">
      <Icon
        :name="columnLabelToIconMap[title].name"
        size="20"
        :class="`translate-y-1 ${columnLabelToIconMap[title].class}`"
      />
      <h3 class="font-semibold">{{ title }}</h3>

      <small class="text-sm font-semibold text-rad-foreground-gray">
        {{ issuesModel.length }}
      </small>
    </div>

    <VueDraggable
      v-model="issuesModel"
      tag="ul"
      class="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2"
      ghost-class="opacity-50"
      :animation="150"
      group="issues"
      :data-column="title"
      :disabled="!auth.isAuthenticated"
      filter="[data-status='closed']"
      @add="handleAdd($event)"
      @update="handleUpdate($event)"
    >
      <li
        v-for="issue in issuesModel"
        :key="issue.id"
        :data-id="issue.id"
        :data-status="issue.state.status"
        :class="{
          'hover:cursor-grab': auth.isAuthenticated && issue.state.status === 'open',
        }"
      >
        <ColumnIssueCard v-bind="issue" />
      </li>
    </VueDraggable>
  </div>
</template>
